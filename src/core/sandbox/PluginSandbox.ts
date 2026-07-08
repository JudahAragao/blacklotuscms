import { logger } from '@/lib/logger';
import { BlackLotusCMSError } from '@/lib/errors';
import { SANDBOX_MEMORY_LIMIT, SANDBOX_TIMEOUT } from '@/lib/config';

export interface PluginManifest {
  name: string;
  version: string;
  permissions: string[];
}

let ivm: typeof import('isolated-vm') | null = null;

async function getIvm() {
  if (!ivm) {
    ivm = await import('isolated-vm');
  }
  return ivm;
}

export class PluginSandbox {
  private isolate: any;
  private context: any;

  static async create(): Promise<PluginSandbox> {
    const ivmMod = await getIvm();
    const sandbox = new PluginSandbox();
    sandbox.isolate = new ivmMod.Isolate({ memoryLimit: SANDBOX_MEMORY_LIMIT });
    sandbox.context = sandbox.isolate.createContextSync();
    return sandbox;
  }

  private constructor() {}

  async execute(code: string, bridgeApi: Record<string, any>) {
    const ivmMod = await getIvm();
    try {
      const jail = this.context.global;

      await jail.set('bridge', new ivmMod.ExternalCopy(bridgeApi).copyInto());

      await jail.set('log', new ivmMod.Reference((...args: any[]) => {
        logger.info('[PLUGIN LOG]', { data: args });
      }));

      const script = await this.isolate.compileScript(code);

      return await script.run(this.context, { timeout: SANDBOX_TIMEOUT * 1000 });
    } catch (err: any) {
      logger.error('Erro na execução do Sandbox de Plugin', {
        error: err.message,
        stack: err.stack
      });

      if (err.message.includes('Script execution timed out') || err.message.includes('Isolate was disposed')) {
        throw new BlackLotusCMSError('Plugin excedeu limites de recurso (Tempo/Memória)', 408, 'RATE_LIMIT_EXCEEDED');
      }

      throw new BlackLotusCMSError(`Falha crítica no plugin: ${err.message}`, 500, 'INTERNAL_SERVER_ERROR');
    }
  }

  dispose() {
    if (this.isolate && !this.isolate.isDisposed) {
      this.context.release();
      this.isolate.dispose();
    }
  }
}
