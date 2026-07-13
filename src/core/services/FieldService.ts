import { prisma } from '@/lib/prisma';
import { CreateFieldGroupSchema, CreateFieldGroupInput } from '@/schemas/field.schema';
import { validateField, shouldShowField } from '@/lib/field-utils';
import { BlackLotusCMSError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { canPerformAction } from '@/lib/auth-utils';

export class FieldService {
  constructor(
    private readonly db = prisma,
    private readonly log = logger
  ) {}

  /**
   * Avalia quais FieldGroups se aplicam a um contexto dado (post, taxonomy, etc).
   */
  async evaluateLocations(context: {
    postTypeId?: string;
    taxonomySlug?: string;
    postSlug?: string;
    postTemplate?: string;
    postStatus?: string;
  }): Promise<any[]> {
    const allLocations = await this.db.fieldGroupLocation.findMany({
      include: { fieldGroup: { include: { fields: true } } }
    });

    const matchedGroupIds = new Set<string>();

    for (const loc of allLocations) {
      let matches = false;

      switch (loc.locationType) {
        case 'post_type':
          matches = loc.locationValue === context.postTypeId;
          break;
        case 'taxonomy':
          matches = loc.locationValue === context.taxonomySlug;
          break;
        case 'post':
          matches = loc.locationValue === context.postSlug;
          break;
        case 'template':
          matches = loc.locationValue === context.postTemplate;
          break;
        case 'post_status':
          matches = loc.locationValue === context.postStatus;
          break;
      }

      if (matches) matchedGroupIds.add(loc.fieldGroupId);
    }

    const matchedGroups = allLocations
      .filter(l => matchedGroupIds.has(l.fieldGroupId))
      .map(l => l.fieldGroup);

    // Deduplicate by id (multiple locations can match the same group)
    const seen = new Set<string>();
    return matchedGroups.filter(g => {
      if (seen.has(g.id)) return false;
      seen.add(g.id);
      return true;
    });
  }

  /**
   * Retorna todos os FieldGroups + Fields que se aplicam a um post específico.
   */
  async getFieldsForPost(postId: string): Promise<any[]> {
    const post = await this.db.post.findUnique({
      where: { id: postId },
      select: { postTypeId: true, slug: true, status: true }
    });

    if (!post) return [];

    return this.evaluateLocations({
      postTypeId: post.postTypeId,
      postSlug: post.slug,
      postStatus: post.status,
    });
  }

  /**
   * Retorna FieldGroups para uma taxonomia.
   */
  async getFieldsForTaxonomy(taxonomySlug: string): Promise<any[]> {
    return this.evaluateLocations({ taxonomySlug });
  }

  /**
   * Lista todos os FieldGroups com locations e fields.
   */
  async listAll() {
    return await this.db.fieldGroup.findMany({
      include: {
        locations: true,
        fields: true,
      },
      orderBy: { title: 'asc' }
    });
  }

  /**
   * Lista FieldGroups por tipo de localização.
   */
  async listByLocation(type: string, value: string, param?: string) {
    const where: any = {
      locations: {
        some: {
          locationType: type,
          locationValue: value,
          ...(param ? { locationParam: param } : {})
        }
      }
    };

    return await this.db.fieldGroup.findMany({
      where,
      include: {
        locations: true,
        fields: true,
      }
    });
  }

  /**
   * Busca um FieldGroup por ID com locations e fields.
   */
  async findById(id: string) {
    return await this.db.fieldGroup.findUnique({
      where: { id },
      include: {
        locations: true,
        fields: true,
      }
    });
  }

  /**
   * Cria um FieldGroup com locations e fields.
   */
  async createFieldGroup(data: CreateFieldGroupInput, user: any) {
    if (!canPerformAction(user, 'post.manage')) {
      throw new BlackLotusCMSError('No permission to create field groups', 403, 'AUTH_FORBIDDEN');
    }

    const validated = CreateFieldGroupSchema.parse(data);

    const group = await this.db.fieldGroup.create({
      data: {
        title: validated.title,
        locations: {
          create: validated.locations.map(loc => ({
            locationType: loc.type,
            locationValue: loc.value,
            locationParam: loc.param || null,
          }))
        },
        fields: {
          create: validated.fields
        }
      },
      include: {
        locations: true,
        fields: true,
      }
    });

    this.log.info(`Field group created: ${validated.title}`, { id: group.id });
    return group;
  }

  /**
   * Atualiza um FieldGroup com locations e fields.
   */
  async updateFieldGroup(id: string, data: CreateFieldGroupInput, user: any) {
    if (!canPerformAction(user, 'post.manage')) {
      throw new BlackLotusCMSError('No permission to update field groups', 403, 'AUTH_FORBIDDEN');
    }

    const validated = CreateFieldGroupSchema.parse(data);

    // Deletar locations antigas e recriar
    await this.db.fieldGroupLocation.deleteMany({
      where: { fieldGroupId: id }
    });

    const group = await this.db.fieldGroup.update({
      where: { id },
      data: {
        title: validated.title,
        locations: {
          create: validated.locations.map(loc => ({
            locationType: loc.type,
            locationValue: loc.value,
            locationParam: loc.param || null,
          }))
        }
      },
      include: {
        locations: true,
        fields: true,
      }
    });

    this.log.info(`Field group updated: ${validated.title}`, { id: group.id });
    return group;
  }

  /**
   * Sincroniza os fields de um FieldGroup.
   */
  async syncFields(fieldGroupId: string, fieldData: any[], user: any) {
    if (!canPerformAction(user, 'post.manage')) {
      throw new BlackLotusCMSError('No permission to sync fields', 403, 'AUTH_FORBIDDEN');
    }

    const currentFields = await this.db.field.findMany({
      where: { fieldGroupId }
    });

    const fieldsToKeep = fieldData.filter(f => f.id);
    const fieldIdsToKeep = fieldsToKeep.map(f => f.id);

    // Remover fields que não estão no novo conjunto
    await this.db.field.deleteMany({
      where: {
        fieldGroupId,
        id: { notIn: fieldIdsToKeep }
      }
    });

    // Upsert dos fields
    for (const f of fieldData) {
      if (f.id) {
        await this.db.field.update({
          where: { id: f.id },
          data: {
            label: f.label,
            name: f.name,
            type: f.type,
            config: f.config || {}
          }
        });
      } else {
        await this.db.field.create({
          data: {
            fieldGroupId,
            label: f.label,
            name: f.name,
            type: f.type,
            config: f.config || {}
          }
        });
      }
    }

    return await this.findById(fieldGroupId);
  }

  /**
   * Deleta um FieldGroup e todas as locations e fields.
   */
  async deleteFieldGroup(id: string, user: any) {
    if (!canPerformAction(user, 'post.manage')) {
      throw new BlackLotusCMSError('No permission to delete field groups', 403, 'AUTH_FORBIDDEN');
    }

    // Deletar fields primeiro (MetaValues são cascade)
    await this.db.field.deleteMany({
      where: { fieldGroupId: id }
    });

    // Deletar locations
    await this.db.fieldGroupLocation.deleteMany({
      where: { fieldGroupId: id }
    });

    // Deletar o grupo
    const deleted = await this.db.fieldGroup.delete({ where: { id } });
    this.log.warn(`Field group deleted: ${deleted.title}`, { id });
    return deleted;
  }

  /**
   * Valida metaFields de um post contra os FieldGroups que se aplicam.
   */
  async validateMetaFields(postTypeId: string, metaFields: Record<string, any>) {
    const fieldGroups = await this.evaluateLocations({ postTypeId });
    const allFields = fieldGroups.flatMap(g => g.fields);

    const fieldIdToNameMap: Record<string, string> = {};
    allFields.forEach(f => {
      fieldIdToNameMap[f.id] = f.name;
    });

    const evalData = {
      metaFields: Object.entries(metaFields).reduce((acc: any, [id, val]) => {
        const name = fieldIdToNameMap[id];
        if (name) acc[name] = val;
        return acc;
      }, {})
    };

    const errors: Record<string, string> = {};

    for (const field of allFields) {
      if (shouldShowField(field.config as any, evalData)) {
        const error = validateField(field, metaFields[field.id]);
        if (error) {
          errors[field.id] = error;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      this.log.warn(`Validation failed for metaFields in PostType ${postTypeId}`, { errors });
      throw new BlackLotusCMSError('Validation error in custom fields', 400, 'VALIDATION_ERROR');
    }
  }

  // --- Static Proxy ---
  static async evaluateLocations(context: any) { return fieldService.evaluateLocations(context); }
  static async getFieldsForPost(postId: string) { return fieldService.getFieldsForPost(postId); }
  static async getFieldsForTaxonomy(taxonomySlug: string) { return fieldService.getFieldsForTaxonomy(taxonomySlug); }
  static async listAll() { return fieldService.listAll(); }
  static async listByLocation(type: string, value: string, param?: string) { return fieldService.listByLocation(type, value, param); }
  static async findById(id: string) { return fieldService.findById(id); }
  static async createFieldGroup(data: any, user: any) { return fieldService.createFieldGroup(data, user); }
  static async updateFieldGroup(id: string, data: any, user: any) { return fieldService.updateFieldGroup(id, data, user); }
  static async syncFields(fieldGroupId: string, fields: any[], user: any) { return fieldService.syncFields(fieldGroupId, fields, user); }
  static async deleteFieldGroup(id: string, user: any) { return fieldService.deleteFieldGroup(id, user); }
  static async validateMetaFields(postTypeId: string, metaFields: any) { return fieldService.validateMetaFields(postTypeId, metaFields); }
}

export const fieldService = new FieldService();
