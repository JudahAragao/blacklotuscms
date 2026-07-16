import { logger } from '@/lib/logger';

export interface HookMetadata {
  source: string; // Plugin ID or 'core'
  priority: number;
}

type HookCallback = {
  callback: (data: any) => any | Promise<any>;
  metadata: HookMetadata;
};

export class HookService {
  private actions: Map<string, HookCallback[]> = new Map();
  private filters: Map<string, HookCallback[]> = new Map();
  private uiComponents: Map<string, HookCallback[]> = new Map();
  private auditLog: { hook: string; type: string; source: string; timestamp: Date }[] = [];

  constructor(private readonly log = logger) {}

  /**
   * Registers a UI component for a specific slot.
   */
  registerComponent(slot: string, component: any, source: string = 'core', priority: number = 10) {
    const existing = this.uiComponents.get(slot) || [];
    const newEntry = { callback: component, metadata: { source, priority } };
    const updated = [...existing, newEntry].sort((a, b) => a.metadata.priority - b.metadata.priority);
    this.uiComponents.set(slot, updated);
  }

  /**
   * Returns components registered for a slot.
   */
  getComponents(slot: string) {
    return (this.uiComponents.get(slot) || []).map(entry => ({
      Component: entry.callback,
      source: entry.metadata.source
    }));
  }

  /**
   * Registers an action with audit metadata.
   */
  addAction(hook: string, callback: (data: any) => any, source: string = 'core', priority: number = 10) {
    const existing = this.actions.get(hook) || [];
    const newCallback = { callback, metadata: { source, priority } };
    
    const updated = [...existing, newCallback].sort((a, b) => a.metadata.priority - b.metadata.priority);
    this.actions.set(hook, updated);
  }

  /**
   * Registers a filter with audit metadata.
   */
  addFilter(hook: string, callback: (data: any) => any, source: string = 'core', priority: number = 10) {
    const existing = this.filters.get(hook) || [];
    const newCallback = { callback, metadata: { source, priority } };
    
    const updated = [...existing, newCallback].sort((a, b) => a.metadata.priority - b.metadata.priority);
    this.filters.set(hook, updated);
  }

  /**
   * Executes actions in an audited manner.
   */
  async doAction(hook: string, data: any) {
    const callbacks = this.actions.get(hook) || [];
    for (const entry of callbacks) {
      try {
        this.logAudit(hook, 'action', entry.metadata.source);
        const dataCopy = data !== undefined ? JSON.parse(JSON.stringify(data)) : data;
        await entry.callback(dataCopy);
      } catch (err) {
        this.log.error(`Error in action of hook ${hook}`, { source: entry.metadata.source, err });
      }
    }
  }

  /**
   * Applies filters in an audited and secure manner.
   */
  async applyFilters(hook: string, data: any): Promise<any> {
    const callbacks = this.filters.get(hook) || [];
    let result = data;

    for (const entry of callbacks) {
      try {
        this.logAudit(hook, 'filter', entry.metadata.source);
        
        const inputCopy = typeof result === 'object' && result !== null ? JSON.parse(JSON.stringify(result)) : result;
        
        result = await entry.callback(inputCopy);

        if (typeof result === 'string' && this.shouldSanitize(hook)) {
          const { purify } = await import('@/lib/dompurify-server');
          result = await purify(result);
        }
      } catch (err) {
        this.log.error(`Error in filter of hook ${hook}`, { source: entry.metadata.source, err });
      }
    }
    return result;
  }

  private logAudit(hook: string, type: string, source: string) {
    this.auditLog.push({ hook, type, source, timestamp: new Date() });
    if (this.auditLog.length > 1000) this.auditLog.shift();
  }

  private shouldSanitize(hook: string): boolean {
    const dangerousKeywords = ['content', 'title', 'html', 'description', 'body', 'name'];
    return dangerousKeywords.some(kw => hook.toLowerCase().includes(kw));
  }

  getAuditLog() {
    return this.auditLog;
  }

  removeHooksBySource(source: string) {
    const cleaner = (map: Map<string, HookCallback[]>) => {
      for (const [hook, callbacks] of map.entries()) {
        map.set(hook, callbacks.filter(cb => cb.metadata.source !== source));
      }
    };
    cleaner(this.actions);
    cleaner(this.filters);
  }

  // --- Static Proxy ---
  static registerComponent(s: string, c: any, src?: string, p?: number) { return hookService.registerComponent(s, c, src, p); }
  static getComponents(s: string) { return hookService.getComponents(s); }
  static addAction(h: string, c: any, src?: string, p?: number) { return hookService.addAction(h, c, src, p); }
  static addFilter(h: string, c: any, src?: string, p?: number) { return hookService.addFilter(h, c, src, p); }
  static async doAction(h: string, d: any) { return hookService.doAction(h, d); }
  static async applyFilters(h: string, d: any) { return hookService.applyFilters(h, d); }
  static getAuditLog() { return hookService.getAuditLog(); }
  static removeHooksBySource(s: string) { return hookService.removeHooksBySource(s); }
}

export const hookService = new HookService();
