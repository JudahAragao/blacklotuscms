import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { BlackLotusCMSError } from "@/lib/errors";

const HTTP_RATE_LIMIT_WINDOW = 1000; // 1 second
const HTTP_RATE_LIMIT_DEFAULT = 20;
const HTTP_TIMEOUT_DEFAULT = 10000; // 10s
const HTTP_TIMEOUT_MAX = 30000; // 30s
const HTTP_MAX_RESPONSE_SIZE = 1024 * 1024; // 1MB
const WEBHOOK_MAX_PAYLOAD = 2 * 1024 * 1024; // 2MB

// Internal/private IP ranges to block (SSRF protection)
const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
]);

const BLOCKED_IP_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^fc00:/,
  /^fd00:/,
];

interface HttpRateLimitEntry {
  requests: number;
  lastReset: number;
}

interface WebhookHandler {
  eventId: string;
  callback: (data: any) => Promise<any>;
  pluginId: string;
}

export interface WebhookPayload {
  eventId: string;
  data: any;
  signature?: string;
  timestamp: string;
  source: string;
}

export class NetworkService {
  private httpRateLimits = new Map<string, HttpRateLimitEntry>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private webhookHandlers = new Map<string, WebhookHandler[]>();
  private webhookQueue: Array<{ handler: WebhookHandler; payload: WebhookPayload; retries: number }> = [];
  private processingQueue = false;

  constructor(
    private readonly db = prisma,
    private readonly log = logger
  ) {
    // Clean up expired rate limit entries every 60s
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [pluginId, entry] of this.httpRateLimits.entries()) {
        if (now - entry.lastReset > 60000) {
          this.httpRateLimits.delete(pluginId);
        }
      }
    }, 60000);
  }

  // ============================================
  // HTTP OUTBOUND
  // ============================================

  /**
   * Validates that a URL is allowed (not internal, domain is whitelisted).
   */
  private validateUrl(url: string, allowedDomains: string[]): void {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new BlackLotusCMSError("Invalid URL format", 400, "VALIDATION_ERROR");
    }

    // Block non-http(s) protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new BlackLotusCMSError("Only HTTP/HTTPS protocols are allowed", 400, "VALIDATION_ERROR");
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block internal hosts (SSRF protection)
    if (BLOCKED_HOSTS.has(hostname)) {
      throw new BlackLotusCMSError("Access to internal hosts is forbidden", 403, "AUTH_FORBIDDEN");
    }

    for (const range of BLOCKED_IP_RANGES) {
      if (range.test(hostname)) {
        throw new BlackLotusCMSError("Access to private IP ranges is forbidden", 403, "AUTH_FORBIDDEN");
      }
    }

    // Domain whitelist check
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => {
        if (domain.startsWith("*.")) {
          // Wildcard: *.example.com matches sub.example.com
          const baseDomain = domain.slice(2);
          return hostname === baseDomain || hostname.endsWith("." + baseDomain);
        }
        return hostname === domain;
      });

      if (!isAllowed) {
        throw new BlackLotusCMSError(
          `Domain '${hostname}' is not in the allowed domains whitelist.`,
          403,
          "DOMAIN_BLOCKED"
        );
      }
    }
  }

  /**
   * Checks HTTP rate limit for a plugin (separate from DB rate limit).
   */
  private checkHttpRateLimit(pluginId: string, maxRate: number): void {
    const now = Date.now();
    const entry = this.httpRateLimits.get(pluginId) || { requests: 0, lastReset: now };

    if (now - entry.lastReset > HTTP_RATE_LIMIT_WINDOW) {
      entry.requests = 1;
      entry.lastReset = now;
    } else {
      entry.requests++;
    }

    this.httpRateLimits.set(pluginId, entry);

    if (entry.requests > maxRate) {
      throw new BlackLotusCMSError(
        `HTTP rate limit exceeded (${maxRate} req/s)`,
        429,
        "RATE_LIMIT_EXCEEDED"
      );
    }
  }

  /**
   * Makes an outbound HTTP request on behalf of a plugin.
   */
  async makeRequest(
    pluginId: string,
    config: {
      url: string;
      method?: string;
      headers?: Record<string, string>;
      body?: any;
      timeout?: number;
    }
  ): Promise<{ status: number; headers: Record<string, string>; body: any }> {
    // Get network config for this plugin
    const networkConfig = await this.db.pluginNetworkConfig.findUnique({
      where: { pluginId },
    });

    if (!networkConfig || !networkConfig.isActive) {
      throw new BlackLotusCMSError(
        "Plugin does not have network access configured",
        403,
        "AUTH_FORBIDDEN"
      );
    }

    // Rate limit check (HTTP-specific, separate from DB rate limit)
    this.checkHttpRateLimit(pluginId, networkConfig.httpRateLimit);

    // URL validation (SSRF + whitelist)
    this.validateUrl(config.url, networkConfig.allowedDomains);

    const method = (config.method || "GET").toUpperCase();
    const timeout = Math.min(config.timeout || HTTP_TIMEOUT_DEFAULT, HTTP_TIMEOUT_MAX);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const fetchOptions: RequestInit = {
        method,
        headers: {
          ...config.headers,
          "User-Agent": "BlackLotusCMS-Plugin/1.0",
        },
        signal: controller.signal,
      };

      if (config.body && ["POST", "PUT", "PATCH"].includes(method)) {
        fetchOptions.body = typeof config.body === "string" ? config.body : JSON.stringify(config.body);
        if (!config.headers?.["Content-Type"]) {
          (fetchOptions.headers as Record<string, string>)["Content-Type"] = "application/json";
        }
      }

      const response = await fetch(config.url, fetchOptions);
      clearTimeout(timeoutId);

      // Check response size
      const text = await response.text();
      if (text.length > HTTP_MAX_RESPONSE_SIZE) {
        throw new BlackLotusCMSError("Response too large", 413, "VALIDATION_ERROR");
      }

      // Parse body (try JSON, fallback to text)
      let body: any = text;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          body = JSON.parse(text);
        } catch {
          // Keep as text
        }
      }

      // Convert headers to plain object
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      // Audit log
      await this.logAudit(pluginId, "http.outbound", config.url, method, response.status);

      return { status: response.status, headers, body };
    } catch (err: any) {
      if (err.name === "AbortError") {
        await this.logAudit(pluginId, "http.outbound", config.url, method, 408, "Timeout");
        throw new BlackLotusCMSError(`HTTP request timed out (${timeout}ms)`, 408, "RATE_LIMIT_EXCEEDED");
      }

      await this.logAudit(pluginId, "http.outbound", config.url, method, 500, err.message);
      throw new BlackLotusCMSError(`HTTP request failed: ${err.message}`, 500, "INTERNAL_SERVER_ERROR");
    }
  }

  // ============================================
  // WEBHOOK INBOUND
  // ============================================

  /**
   * Registers a webhook handler for a plugin.
   */
  registerWebhookHandler(
    pluginId: string,
    eventId: string,
    callback: (data: any) => Promise<any>
  ): void {
    const handlers = this.webhookHandlers.get(eventId) || [];
    // Remove existing handler from same plugin
    const filtered = handlers.filter(h => h.pluginId !== pluginId);
    filtered.push({ eventId, callback, pluginId });
    this.webhookHandlers.set(eventId, filtered);
    this.log.info(`Webhook handler registered: ${eventId} for plugin ${pluginId}`);
  }

  /**
   * Removes a specific webhook handler for a plugin+event.
   */
  removeWebhookHandler(pluginId: string, eventId: string): void {
    const handlers = this.webhookHandlers.get(eventId);
    if (!handlers) return;
    const filtered = handlers.filter(h => h.pluginId !== pluginId);
    if (filtered.length === 0) {
      this.webhookHandlers.delete(eventId);
    } else {
      this.webhookHandlers.set(eventId, filtered);
    }
  }

  /**
   * Removes all webhook handlers for a plugin.
   */
  removeAllWebhookHandlers(pluginId: string): void {
    for (const [eventId, handlers] of this.webhookHandlers.entries()) {
      const filtered = handlers.filter(h => h.pluginId !== pluginId);
      if (filtered.length === 0) {
        this.webhookHandlers.delete(eventId);
      } else {
        this.webhookHandlers.set(eventId, filtered);
      }
    }
  }

  /**
   * Verifies webhook signature using HMAC-SHA256.
   */
  async verifyWebhookSignature(
    pluginId: string,
    payload: string,
    signature: string
  ): Promise<boolean> {
    const networkConfig = await this.db.pluginNetworkConfig.findUnique({
      where: { pluginId },
    });

    if (!networkConfig?.webhookSecret) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(networkConfig.webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    return signature === expectedSignature;
  }

  /**
   * Receives and processes an inbound webhook.
   */
  async receiveWebhook(
    pluginName: string,
    eventId: string,
    payload: any,
    signature?: string
  ): Promise<{ received: boolean; message: string }> {
    // Find plugin
    const plugin = await this.db.plugin.findUnique({ where: { name: pluginName } });
    if (!plugin || !plugin.isActive) {
      throw new BlackLotusCMSError("Plugin not found or inactive", 404, "RESOURCE_NOT_FOUND");
    }

    // Verify signature if webhookSecret is configured
    if (signature) {
      const isValid = await this.verifyWebhookSignature(
        plugin.id,
        JSON.stringify(payload),
        signature
      );
      if (!isValid) {
        throw new BlackLotusCMSError("Invalid webhook signature", 401, "AUTH_UNAUTHORIZED");
      }
    }

    // Check payload size
    const payloadSize = new TextEncoder().encode(JSON.stringify(payload)).length;
    if (payloadSize > WEBHOOK_MAX_PAYLOAD) {
      throw new BlackLotusCMSError("Webhook payload too large", 413, "VALIDATION_ERROR");
    }

    // Audit log
    await this.logAudit(plugin.id, "webhook.inbound", `/api/v1/webhooks/${pluginName}/${eventId}`, "POST", 200);

    // Find registered handlers
    const handlers = this.webhookHandlers.get(eventId);
    if (!handlers || handlers.length === 0) {
      this.log.warn(`No webhook handlers registered for event: ${eventId}`);
      return { received: false, message: "No handlers registered for this event" };
    }

    // Enqueue for async processing with retry
    for (const handler of handlers) {
      if (handler.pluginId === plugin.id) {
        this.enqueueWebhook(handler, {
          eventId,
          data: payload,
          signature,
          timestamp: new Date().toISOString(),
          source: pluginName,
        });
      }
    }

    return { received: true, message: `Webhook queued for ${handlers.length} handler(s)` };
  }

  /**
   * Enqueues a webhook for async processing with retry.
   */
  private enqueueWebhook(handler: WebhookHandler, payload: WebhookPayload): void {
    this.webhookQueue.push({ handler, payload, retries: 0 });
    this.processQueue();
  }

  /**
   * Processes the webhook queue sequentially.
   */
  private async processQueue(): Promise<void> {
    if (this.processingQueue) return;
    this.processingQueue = true;

    while (this.webhookQueue.length > 0) {
      const item = this.webhookQueue.shift()!;
      try {
        await item.handler.callback(item.payload);
      } catch (err: any) {
        this.log.error(`Webhook processing failed for ${item.payload.eventId}`, { error: err.message });
        // Retry up to 3 times with exponential backoff
        if (item.retries < 3) {
          const delay = Math.pow(2, item.retries) * 1000; // 1s, 2s, 4s
          setTimeout(() => {
            this.webhookQueue.push({ ...item, retries: item.retries + 1 });
            this.processQueue();
          }, delay);
        } else {
          this.log.error(`Webhook discarded after 3 retries: ${item.payload.eventId}`);
        }
      }
    }

    this.processingQueue = false;
  }

  // ============================================
  // AUDIT & CONFIG
  // ============================================

  /**
   * Logs network activity for audit purposes.
   */
  private async logAudit(
    pluginId: string,
    type: string,
    url: string | undefined,
    method: string | undefined,
    status: number,
    error?: string
  ): Promise<void> {
    try {
      const plugin = await this.db.plugin.findUnique({ where: { id: pluginId }, select: { name: true } });
      await this.db.networkAuditLog.create({
        data: {
          pluginId,
          pluginName: plugin?.name || "unknown",
          type,
          url,
          method,
          status,
          error,
        },
      });
    } catch (err) {
      this.log.error("Failed to write network audit log", { error: err });
    }
  }

  /**
   * Gets network config for a plugin.
   */
  async getConfig(pluginId: string) {
    return this.db.pluginNetworkConfig.findUnique({ where: { pluginId } });
  }

  /**
   * Updates network config for a plugin (admin only).
   */
  async updateConfig(pluginId: string, data: { allowedDomains?: string[]; httpRateLimit?: number; webhookSecret?: string; isActive?: boolean }) {
    return this.db.pluginNetworkConfig.upsert({
      where: { pluginId },
      update: data,
      create: { pluginId, ...data },
    });
  }

  /**
   * Gets audit logs for a plugin.
   */
  async getAuditLogs(pluginId: string, limit = 50) {
    return this.db.networkAuditLog.findMany({
      where: { pluginId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  /**
   * Gets all webhook endpoints for a plugin.
   */
  async getWebhookEndpoints(pluginId: string) {
    return this.db.webhookEndpoint.findMany({ where: { pluginId } });
  }

  /**
   * Creates a webhook endpoint for a plugin.
   */
  async createWebhookEndpoint(pluginId: string, eventId: string) {
    const plugin = await this.db.plugin.findUnique({ where: { id: pluginId }, select: { name: true } });
    if (!plugin) throw new BlackLotusCMSError("Plugin not found", 404, "RESOURCE_NOT_FOUND");

    return this.db.webhookEndpoint.upsert({
      where: { pluginId_eventId: { pluginId, eventId } },
      update: {},
      create: {
        pluginId,
        eventId,
        url: `/api/v1/webhooks/${plugin.name}/${eventId}`,
      },
    });
  }

  /**
   * Generates a webhook secret for a plugin.
   */
  generateWebhookSecret(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // --- Static Proxy ---
  static async makeRequest(pluginId: string, config: any) { return networkService.makeRequest(pluginId, config); }
  static async receiveWebhook(pluginName: string, eventId: string, payload: any, signature?: string) { return networkService.receiveWebhook(pluginName, eventId, payload, signature); }
  static async getConfig(pluginId: string) { return networkService.getConfig(pluginId); }
  static async updateConfig(pluginId: string, data: any) { return networkService.updateConfig(pluginId, data); }
  static async getAuditLogs(pluginId: string, limit?: number) { return networkService.getAuditLogs(pluginId, limit); }
}

export const networkService = new NetworkService();
