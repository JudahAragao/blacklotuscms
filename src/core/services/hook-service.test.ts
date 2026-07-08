import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HookService } from './HookService';

describe('HookService', () => {
  let hookService: HookService;

  beforeEach(() => {
    hookService = new HookService();
  });

  describe('Actions', () => {
    it('should execute registered action', async () => {
      const callback = vi.fn();
      hookService.addAction('test.action', callback);
      await hookService.doAction('test.action', { data: 'hello' });
      expect(callback).toHaveBeenCalledWith({ data: 'hello' });
    });

    it('should execute multiple actions in priority order', async () => {
      const order: number[] = [];
      hookService.addAction('test.action', () => order.push(2), 'core', 20);
      hookService.addAction('test.action', () => order.push(1), 'core', 10);
      await hookService.doAction('test.action', {});
      expect(order).toEqual([1, 2]);
    });

    it('should not fail if action throws', async () => {
      hookService.addAction('test.action', () => { throw new Error('fail'); });
      await expect(hookService.doAction('test.action', {})).resolves.not.toThrow();
    });

    it('should pass data copy to action (not reference)', async () => {
      const original = { nested: { value: 1 } };
      hookService.addAction('test.action', (data) => { data.nested.value = 999; });
      await hookService.doAction('test.action', original);
      expect(original.nested.value).toBe(1);
    });
  });

  describe('Filters', () => {
    it('should transform data through filter pipeline', async () => {
      hookService.addFilter('test.filter', (data) => ({ ...data, added: true }));
      const result = await hookService.applyFilters('test.filter', { original: true });
      expect(result).toEqual({ original: true, added: true });
    });

    it('should chain multiple filters', async () => {
      hookService.addFilter('test.filter', (data) => ({ ...data, step: 1 }));
      hookService.addFilter('test.filter', (data) => ({ ...data, step: data.step + 1 }));
      const result = await hookService.applyFilters('test.filter', {});
      expect(result).toEqual({ step: 2 });
    });

    it('should return original data if no filters registered', async () => {
      const data = { key: 'value' };
      const result = await hookService.applyFilters('nonexistent.filter', data);
      expect(result).toEqual(data);
    });
  });

  describe('UI Components', () => {
    it('should register and retrieve components', () => {
      const Component = () => null;
      hookService.registerComponent('admin.header', Component, 'plugin-1');
      const components = hookService.getComponents('admin.header');
      expect(components).toHaveLength(1);
      expect(components[0].Component).toBe(Component);
      expect(components[0].source).toBe('plugin-1');
    });

    it('should return empty array for unregistered slot', () => {
      expect(hookService.getComponents('nonexistent')).toEqual([]);
    });
  });

  describe('Audit Log', () => {
    it('should log actions', async () => {
      hookService.addAction('test.action', () => {});
      await hookService.doAction('test.action', {});
      const log = hookService.getAuditLog();
      expect(log.length).toBeGreaterThan(0);
      expect(log[log.length - 1].hook).toBe('test.action');
      expect(log[log.length - 1].type).toBe('action');
    });

    it('should limit audit log to 1000 entries', async () => {
      hookService.addAction('test.action', () => {});
      for (let i = 0; i < 1005; i++) {
        await hookService.doAction('test.action', {});
      }
      expect(hookService.getAuditLog().length).toBeLessThanOrEqual(1000);
    });
  });

  describe('removeHooksBySource', () => {
    it('should remove all hooks from a specific source', () => {
      hookService.addAction('test.action', () => {}, 'plugin-1');
      hookService.addAction('test.action', () => {}, 'plugin-2');
      hookService.removeHooksBySource('plugin-1');
      // plugin-2's hook should still be there
      hookService.doAction('test.action', {});
    });
  });
});
