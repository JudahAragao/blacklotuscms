import { describe, it, expect } from 'vitest';

describe('Service Pattern Validation', () => {
  describe('Static Proxy Pattern', () => {
    it('PostService should have static proxy methods', async () => {
      const { PostService } = await import('./PostService');
      expect(typeof PostService.create).toBe('function');
      expect(typeof PostService.getLeanPostBySlug).toBe('function');
      expect(typeof PostService.getLeanPostsByType).toBe('function');
      expect(typeof PostService.getById).toBe('function');
      expect(typeof PostService.update).toBe('function');
      expect(typeof PostService.delete).toBe('function');
    });

    it('UserService should have static proxy methods', async () => {
      const { UserService } = await import('./UserService');
      expect(typeof UserService.create).toBe('function');
      expect(typeof UserService.update).toBe('function');
      expect(typeof UserService.delete).toBe('function');
    });

    it('MediaService should have static proxy methods', async () => {
      const { MediaService } = await import('./MediaService');
      expect(typeof MediaService.upload).toBe('function');
      expect(typeof MediaService.list).toBe('function');
      expect(typeof MediaService.delete).toBe('function');
    });

    it('SettingService should have static proxy methods', async () => {
      const { SettingService } = await import('./SettingService');
      expect(typeof SettingService.get).toBe('function');
      expect(typeof SettingService.set).toBe('function');
      expect(typeof SettingService.getAll).toBe('function');
    });

    it('ThemeService should have static proxy methods', async () => {
      const { ThemeService } = await import('./ThemeService');
      expect(typeof ThemeService.getActiveTheme).toBe('function');
      expect(typeof ThemeService.setActiveTheme).toBe('function');
      expect(typeof ThemeService.listThemes).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('BlackLotusCMSError should have correct properties', async () => {
      const { BlackLotusCMSError } = await import('@/lib/errors');
      const error = new BlackLotusCMSError('Test', 422, 'VALIDATION_ERROR');
      expect(error.message).toBe('Test');
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('BlackLotusCMSError');
    });
  });
});
