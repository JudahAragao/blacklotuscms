import { describe, it, expect } from 'vitest';
import { hasCapability, canPerformAction } from './auth-utils';

describe('hasCapability', () => {
  const adminRole = {
    id: '1',
    name: 'Administrador',
    capabilities: {},
  };

  const editorRole = {
    id: '2',
    name: 'Editor',
    capabilities: {
      post: { create: true, read: true, update: true, delete: true },
      media: { create: true, read: true },
    },
  };

  const authorRole = {
    id: '3',
    name: 'Autor',
    capabilities: {
      post: { create: true, read: true, update: true, own: true },
    },
  };

  it('should return true for Administrador always', () => {
    expect(hasCapability(adminRole, 'any.permission')).toBe(true);
    expect(hasCapability(adminRole, 'nonexistent')).toBe(true);
  });

  it('should check flat capabilities', () => {
    expect(hasCapability(editorRole, 'post.create')).toBe(true);
    expect(hasCapability(editorRole, 'post.delete')).toBe(true);
    expect(hasCapability(editorRole, 'plugin.install')).toBe(false);
  });

  it('should check nested capabilities', () => {
    expect(hasCapability(editorRole, 'media.create')).toBe(true);
    expect(hasCapability(editorRole, 'media.delete')).toBe(false);
  });

  it('should check own capabilities with checkOwn flag', () => {
    expect(hasCapability(authorRole, 'post.update', true)).toBe(true);
    expect(hasCapability(authorRole, 'post.update', false)).toBe(false);
  });
});

describe('canPerformAction', () => {
  const user = {
    id: 'user-1',
    role: {
      id: '2',
      name: 'Autor',
      capabilities: {
        post: { create: true, read: true, update: true, own: true },
      },
    },
  };

  const adminUser = {
    id: 'admin-1',
    role: {
      id: '1',
      name: 'Administrador',
      capabilities: {},
    },
  };

  it('should allow admin to do anything', () => {
    expect(canPerformAction(adminUser, 'post.delete')).toBe(true);
  });

  it('should allow user with general permission', () => {
    expect(canPerformAction(user, 'post.create')).toBe(true);
  });

  it('should allow owner with own permission', () => {
    expect(canPerformAction(user, 'post.update', 'user-1')).toBe(true);
  });

  it('should deny non-owner without general permission', () => {
    expect(canPerformAction(user, 'post.update', 'other-user')).toBe(false);
  });

  it('should deny user without any permission', () => {
    expect(canPerformAction(user, 'plugin.install')).toBe(false);
  });

  it('should deny null user', () => {
    expect(canPerformAction(null, 'post.create')).toBe(false);
  });
});
