import ivm from 'isolated-vm';
import { logger } from '@/lib/logger';
import { BlackLotusCMSError } from '@/lib/errors';
import { SANDBOX_MEMORY_LIMIT, SANDBOX_TIMEOUT } from '@/lib/config';

export interface PluginManifest {
  name: string;
  version: string;
  permissions: string[];
}

export class PluginSandbox {
  private isolate: ivm.Isolate;
  private context: ivm.Context;

  constructor() {
    this.isolate = new ivm.Isolate({ memoryLimit: SANDBOX_MEMORY_LIMIT });
    this.context = this.isolate.createContextSync();
  }

  /**
   * Executa um script de plugin dentro do sandbox com Bridge API e controle de erros.
   */
  async execute(code: string, bridgeApi: Record<string, any>) {
    try {
      const jail = this.context.global;

      // Criar a Bridge API segura
      await jail.set('bridge', new ivm.ExternalCopy(bridgeApi).copyInto());
      
      // Injetar logger seguro
      await jail.set('log', new ivm.Reference((...args: any[]) => {
        logger.info('[PLUGIN LOG]', { data: args });
      }));

      const script = await this.isolate.compileScript(code);
      
      // Execução com Timeout para evitar loops infinitos
      return await script.run(this.context, { timeout: SANDBOX_TIMEOUT * 1000 });
    } catch (err: any) {
      logger.error('Erro na execução do Sandbox de Plugin', { 
        error: err.message,
        stack: err.stack 
      });

      // Erros de memória ou tempo excedido
      if (err.message.includes('Script execution timed out') || err.message.includes('Isolate was disposed')) {
        throw new BlackLotusCMSError('Plugin excedeu limites de recurso (Tempo/Memória)', 408, 'RATE_LIMIT_EXCEEDED');
      }

      throw new BlackLotusCMSError(`Falha crítica no plugin: ${err.message}`, 500, 'INTERNAL_SERVER_ERROR');
    }
  }

  dispose() {
    if (!this.isolate.isDisposed) {
      this.context.release();
      this.isolate.dispose();
    }
  }
}
