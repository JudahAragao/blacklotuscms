import { describe, it, expect, beforeEach } from 'vitest';
import { themeStorage } from '@/lib/theme-context';
import {
  get_field,
  the_field,
  have_rows,
  get_rows,
  get_sub_field,
  the_sub_field,
  get_row_index,
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

  describe('get_field', () => {
    it('returns field value by name', () => {
      withPost(mockPost, () => {
        expect(get_field('titulo')).toBe('Hello World');
        expect(get_field('subtitle')).toBe('My subtitle');
      });
    });

    it('returns null for non-existent field', () => {
      withPost(mockPost, () => {
        expect(get_field('nonexistent')).toBeNull();
      });
    });

    it('returns boolean fields', () => {
      withPost(mockPost, () => {
        expect(get_field('is_featured')).toBe(true);
      });
    });

    it('returns array fields (gallery)', () => {
      withPost(mockPost, () => {
        expect(get_field('gallery')).toEqual(['/uploads/img1.jpg', '/uploads/img2.jpg']);
      });
    });

    it('returns repeater fields (array of objects)', () => {
      withPost(mockPost, () => {
        const members = get_field('team_members');
        expect(members).toHaveLength(2);
        expect(members[0].name).toBe('Alice');
        expect(members[1].role).toBe('CTO');
      });
    });

    it('returns flexible content fields', () => {
      withPost(mockPost, () => {
        const sections = get_field('page_sections');
        expect(sections).toHaveLength(2);
        expect(sections[0]._layout).toBe('hero');
        expect(sections[1]._layout).toBe('text_block');
      });
    });

    it('returns null when no post context', () => {
      // No themeStorage.run — no context
      expect(get_field('titulo')).toBeNull();
    });
  });

  describe('the_field', () => {
    it('is an alias for get_field', () => {
      withPost(mockPost, () => {
        expect(the_field('titulo')).toBe(get_field('titulo'));
      });
    });
  });

  describe('have_rows', () => {
    it('returns true for non-empty array', () => {
      withPost(mockPost, () => {
        expect(have_rows('team_members')).toBe(true);
        expect(have_rows('page_sections')).toBe(true);
      });
    });

    it('returns false for non-array values', () => {
      withPost(mockPost, () => {
        expect(have_rows('titulo')).toBe(false);
        expect(have_rows('is_featured')).toBe(false);
      });
    });

    it('returns false for empty arrays', () => {
      withPost({ ...mockPost, meta: { ...mockPost.meta, empty_list: [] } }, () => {
        expect(have_rows('empty_list')).toBe(false);
      });
    });

    it('returns false for non-existent fields', () => {
      withPost(mockPost, () => {
        expect(have_rows('nonexistent')).toBe(false);
      });
    });
  });

  describe('get_rows', () => {
    it('returns array for repeater fields', () => {
      withPost(mockPost, () => {
        const rows = get_rows('team_members');
        expect(rows).toHaveLength(2);
        expect(rows[0].name).toBe('Alice');
      });
    });

    it('returns empty array for non-array fields', () => {
      withPost(mockPost, () => {
        expect(get_rows('titulo')).toEqual([]);
      });
    });

    it('returns empty array for non-existent fields', () => {
      withPost(mockPost, () => {
        expect(get_rows('nonexistent')).toEqual([]);
      });
    });
  });

  describe('rowContext / get_sub_field', () => {
    it('returns sub-field value from row context', () => {
      const row = { name: 'Alice', role: 'CEO', photo: '/uploads/alice.webp' };
      rowContext.run(row, () => {
        expect(get_sub_field('name')).toBe('Alice');
        expect(get_sub_field('role')).toBe('CEO');
      });
    });

    it('returns null when no row context', () => {
      expect(get_sub_field('name')).toBeNull();
    });

    it('the_sub_field is alias for get_sub_field', () => {
      const row = { name: 'Bob' };
      rowContext.run(row, () => {
        expect(the_sub_field('name')).toBe(get_sub_field('name'));
      });
    });
  });

  describe('get_row_index', () => {
    it('returns index from row context', () => {
      const row = { __index: 2, name: 'Test' };
      rowContext.run(row, () => {
        expect(get_row_index()).toBe(2);
      });
    });

    it('returns 0 when no row context', () => {
      expect(get_row_index()).toBe(0);
    });
  });

  describe('repeater iteration pattern', () => {
    it('simulates map with rowContext', () => {
      withPost(mockPost, () => {
        const rows = get_rows('team_members');
        const results = rows.map((row, i) => {
          return rowContext.run({ ...row, __index: i }, () => {
            return {
              index: get_row_index(),
              name: get_sub_field('name'),
              role: get_sub_field('role'),
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
