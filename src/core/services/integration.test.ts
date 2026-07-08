import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HookService } from './HookService';

describe('HookService Integration', () => {
  let hookService: HookService;

  beforeEach(() => {
    hookService = new HookService();
  });

  describe('Action + Filter pipeline', () => {
    it('should execute action then apply filter on same hook name', async () => {
      const actionLog: string[] = [];
      hookService.addAction('post.created', (data) => {
        actionLog.push('action:post.created');
      });
      hookService.addFilter('post.created', (data) => {
        actionLog.push('filter:post.created');
        return data;
      });
      await hookService.doAction('post.created', { id: '1' });
      // Actions and filters are separate maps, doAction only triggers actions
      expect(actionLog).toEqual(['action:post.created']);
    });

    it('should chain filters and pass transformed data through', async () => {
      hookService.addFilter('post.before_validate', (data) => ({
        ...data,
        title: data.title?.toUpperCase(),
      }));
      hookService.addFilter('post.before_validate', (data) => ({
        ...data,
        slug: data.title?.toLowerCase().replace(/\s+/g, '-'),
      }));

      const result = await hookService.applyFilters('post.before_validate', {
        title: 'Hello World',
      });

      expect(result.title).toBe('HELLO WORLD');
      expect(result.slug).toBe('hello-world');
    });

    it('should isolate data between actions (no cross-contamination)', async () => {
      const results: any[] = [];
      hookService.addAction('test.event', (data) => {
        data.modified = true;
        results.push({ ...data });
      });
      hookService.addAction('test.event', (data) => {
        results.push({ ...data });
      });

      await hookService.doAction('test.event', { value: 1 });
      // First action modifies its copy, second gets original
      expect(results[0].modified).toBe(true);
      expect(results[1].modified).toBeUndefined();
    });
  });

  describe('Multi-source hook management', () => {
    it('should register hooks from multiple sources', () => {
      hookService.addAction('event', () => {}, 'plugin-a');
      hookService.addAction('event', () => {}, 'plugin-b');
      hookService.addAction('event', () => {}, 'core');

      const log = hookService.getAuditLog();
      // No audit entries yet (only on execution)
      expect(log).toHaveLength(0);
    });

    it('should remove hooks by source without affecting others', async () => {
      const called: string[] = [];
      hookService.addAction('event', () => called.push('a'), 'plugin-a');
      hookService.addAction('event', () => called.push('b'), 'plugin-b');

      hookService.removeHooksBySource('plugin-a');
      await hookService.doAction('event', {});

      expect(called).toEqual(['b']);
    });
  });

  describe('UI Component slots', () => {
    it('should support multiple components per slot with priority ordering', () => {
      const CompA = () => null;
      const CompB = () => null;
      const CompC = () => null;

      hookService.registerComponent('admin.header', CompC, 'plugin-c', 30);
      hookService.registerComponent('admin.header', CompA, 'plugin-a', 10);
      hookService.registerComponent('admin.header', CompB, 'plugin-b', 20);

      const components = hookService.getComponents('admin.header');
      expect(components).toHaveLength(3);
      expect(components[0].Component).toBe(CompA);
      expect(components[1].Component).toBe(CompB);
      expect(components[2].Component).toBe(CompC);
    });

    it('should isolate components between slots', () => {
      const Comp = () => null;
      hookService.registerComponent('slot-a', Comp, 'core');
      expect(hookService.getComponents('slot-a')).toHaveLength(1);
      expect(hookService.getComponents('slot-b')).toHaveLength(0);
    });
  });

  describe('Audit log management', () => {
    it('should record action executions with metadata', async () => {
      hookService.addAction('user.created', () => {}, 'auth-system');
      await hookService.doAction('user.created', { id: '123' });

      const log = hookService.getAuditLog();
      expect(log).toHaveLength(1);
      expect(log[0]).toMatchObject({
        hook: 'user.created',
        type: 'action',
        source: 'auth-system',
      });
      expect(log[0].timestamp).toBeInstanceOf(Date);
    });

    it('should record filter executions', async () => {
      hookService.addFilter('content.title', (d) => d, 'seo-plugin');
      await hookService.applyFilters('content.title', 'test');

      const log = hookService.getAuditLog();
      expect(log).toHaveLength(1);
      expect(log[0].type).toBe('filter');
    });
  });
});
