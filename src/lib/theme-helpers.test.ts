import { describe, it, expect, beforeEach } from 'vitest';
import { themeStorage } from '@/lib/theme-context';
import {
  getField,
  theField,
  haveRows,
  getRows,
  getSubField,
  theSubField,
  getRowIndex,
  rowContext,
  clearFieldsCache,
} from './theme-helpers';

const mockPost = {
  id: 'post-1',
  title: 'Test Post',
  slug: 'test-post',
  postType: { slug: 'post' },
  meta: {
    titulo: 'Hello World',
    subtitle: 'My subtitle',
    featured_image: '/uploads/hero.webp',
    is_featured: true,
    gallery: ['/uploads/img1.jpg', '/uploads/img2.jpg'],
    team_members: [
      { name: 'Alice', role: 'CEO', photo: '/uploads/alice.webp' },
      { name: 'Bob', role: 'CTO', photo: '/uploads/bob.webp' },
    ],
    page_sections: [
      { _layout: 'hero', title: 'Welcome', background_image: '/uploads/hero.jpg' },
      { _layout: 'text_block', content: '<p>Hello</p>', alignment: 'center' },
    ],
  },
};

function withPost(post: any, fn: () => void) {
  return themeStorage.run({ themeName: 'test', currentPost: post }, fn);
}

describe('theme-helpers', () => {
  beforeEach(() => {
    clearFieldsCache();
  });

  describe('getField', () => {
    it('returns field value by name', () => {
      withPost(mockPost, () => {
        expect(getField('titulo')).toBe('Hello World');
        expect(getField('subtitle')).toBe('My subtitle');
      });
    });

    it('returns null for non-existent field', () => {
      withPost(mockPost, () => {
        expect(getField('nonexistent')).toBeNull();
      });
    });

    it('returns boolean fields', () => {
      withPost(mockPost, () => {
        expect(getField('is_featured')).toBe(true);
      });
    });

    it('returns array fields (gallery)', () => {
      withPost(mockPost, () => {
        expect(getField('gallery')).toEqual(['/uploads/img1.jpg', '/uploads/img2.jpg']);
      });
    });

    it('returns repeater fields (array of objects)', () => {
      withPost(mockPost, () => {
        const members = getField('team_members');
        expect(members).toHaveLength(2);
        expect(members[0].name).toBe('Alice');
        expect(members[1].role).toBe('CTO');
      });
    });

    it('returns flexible content fields', () => {
      withPost(mockPost, () => {
        const sections = getField('page_sections');
        expect(sections).toHaveLength(2);
        expect(sections[0]._layout).toBe('hero');
        expect(sections[1]._layout).toBe('text_block');
      });
    });

    it('returns null when no post context', () => {
      expect(getField('titulo')).toBeNull();
    });
  });

  describe('theField', () => {
    it('is an alias for getField', () => {
      withPost(mockPost, () => {
        expect(theField('titulo')).toBe(getField('titulo'));
      });
    });
  });

  describe('haveRows', () => {
    it('returns true for non-empty array', () => {
      withPost(mockPost, () => {
        expect(haveRows('team_members')).toBe(true);
        expect(haveRows('page_sections')).toBe(true);
      });
    });

    it('returns false for non-array values', () => {
      withPost(mockPost, () => {
        expect(haveRows('titulo')).toBe(false);
        expect(haveRows('is_featured')).toBe(false);
      });
    });

    it('returns false for empty arrays', () => {
      withPost({ ...mockPost, meta: { ...mockPost.meta, empty_list: [] } }, () => {
        expect(haveRows('empty_list')).toBe(false);
      });
    });

    it('returns false for non-existent fields', () => {
      withPost(mockPost, () => {
        expect(haveRows('nonexistent')).toBe(false);
      });
    });
  });

  describe('getRows', () => {
    it('returns array for repeater fields', () => {
      withPost(mockPost, () => {
        const rows = getRows('team_members');
        expect(rows).toHaveLength(2);
        expect(rows[0].name).toBe('Alice');
      });
    });

    it('returns empty array for non-array fields', () => {
      withPost(mockPost, () => {
        expect(getRows('titulo')).toEqual([]);
      });
    });

    it('returns empty array for non-existent fields', () => {
      withPost(mockPost, () => {
        expect(getRows('nonexistent')).toEqual([]);
      });
    });
  });

  describe('rowContext / getSubField', () => {
    it('returns sub-field value from row context', () => {
      const row = { name: 'Alice', role: 'CEO', photo: '/uploads/alice.webp' };
      rowContext.run(row, () => {
        expect(getSubField('name')).toBe('Alice');
        expect(getSubField('role')).toBe('CEO');
      });
    });

    it('returns null when no row context', () => {
      expect(getSubField('name')).toBeNull();
    });

    it('theSubField is alias for getSubField', () => {
      const row = { name: 'Bob' };
      rowContext.run(row, () => {
        expect(theSubField('name')).toBe(getSubField('name'));
      });
    });
  });

  describe('getRowIndex', () => {
    it('returns index from row context', () => {
      const row = { __index: 2, name: 'Test' };
      rowContext.run(row, () => {
        expect(getRowIndex()).toBe(2);
      });
    });

    it('returns 0 when no row context', () => {
      expect(getRowIndex()).toBe(0);
    });
  });

  describe('repeater iteration pattern', () => {
    it('simulates map with rowContext', () => {
      withPost(mockPost, () => {
        const rows = getRows('team_members');
        const results = rows.map((row, i) => {
          return rowContext.run({ ...row, __index: i }, () => {
            return {
              index: getRowIndex(),
              name: getSubField('name'),
              role: getSubField('role'),
            };
          });
        });

        expect(results).toEqual([
          { index: 0, name: 'Alice', role: 'CEO' },
          { index: 1, name: 'Bob', role: 'CTO' },
        ]);
      });
    });
  });
});
