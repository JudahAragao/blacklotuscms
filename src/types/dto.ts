export interface ThemePostDTO {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  publishedAt: Date | null;
  postType: {
    id: string;
    name: string; // label from Prisma
    slug: string;
  };
  seo?: {
    title?: string | null;
    description?: string | null;
    ogImage?: string | null;
    noIndex: boolean;
  };
  meta?: Record<string, any>;
  [key: string]: any;
}

export interface MenuItemDTO {
  id: string;
  label: string;
  url: string;
  order: number;
  children: MenuItemDTO[];
}

export interface MediaDTO {
  id: string;
  name: string;
  url: string;
  thumbnail: string | null;
  mimeType: string;
  size: number;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
  };
  createdBy?: string | null;
  createdAt: Date;
}

export interface PostTypeDTO {
  id: string;
  slug: string;
  label: string;
  hierarchical: boolean;
  supportsTitle: boolean;
  supportsEditor: boolean;
  supportsPermalink: boolean;
  supportsTaxonomies: boolean;
  settings: any;
  _count?: {
    posts: number;
  };
}

export interface TaxonomyDTO {
  id: string;
  slug: string;
  label: string;
  hierarchical: boolean;
  postType?: {
    slug: string;
    label: string;
  };
  terms?: TermDTO[];
}

export interface TermDTO {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  taxonomyId: string;
}

export interface UserDTO {
  id: string;
  email: string;
  image?: string | null;
  role: {
    id: string;
    name: string;
    capabilities: any;
  };
}

export interface CommentDTO {
  id: string;
  postId: string;
  author: string;
  email: string;
  content: string;
  status: string;
  ip?: string | null;
  parentId?: string | null;
  replies?: CommentDTO[];
  createdBy?: string | null;
  createdAt: Date;
}

export interface PluginDTO {
  id: string;
  name: string;
  version: string;
  isActive: boolean;
  manifest: any;
  authorizedPermissions?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThemeDataDTO {
  id: string;
  themeName: string;
  key: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingDTO {
  key: string;
  value: any;
}

export interface ApiKeyDTO {
  id: string;
  name: string;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  rateLimit: number;
}
