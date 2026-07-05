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
   * Creates a field group (FieldGroup) and all associated fields.
   */
  async createFieldGroup(data: CreateFieldGroupInput, user: any) {
    if (!canPerformAction(user, 'post.manage')) {
      throw new BlackLotusCMSError('No permission to create field groups', 403, 'AUTH_FORBIDDEN');
    }

    const validated = CreateFieldGroupSchema.parse(data);

    const group = await this.db.fieldGroup.create({
      data: {
        title: validated.title,
        postTypeId: validated.postTypeId as string,
        locationRules: validated.locationRules,
        fields: {
          create: validated.fields
        }
      },
      include: {
        fields: true
      }
    });

    this.log.info(`Field group created: ${validated.title}`, { id: group.id });
    return group;
  }

  /**
   * Validates a set of metaFields against the PostType field definitions.
   */
  async validateMetaFields(postTypeId: string, metaFields: Record<string, any>) {
    const fieldGroups = await this.listByPostType(postTypeId);
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

  async listByPostType(postTypeId: string) {
    return await this.db.fieldGroup.findMany({
      where: { postTypeId },
      include: { fields: true }
    });
  }

  /**
   * Syncs all custom fields for a PostType into a single primary group.
   */
  async syncFields(postTypeId: string, fieldData: any[], user: any) {
    if (!canPerformAction(user, 'post.manage')) {
      throw new BlackLotusCMSError('No permission to sync custom fields', 403, 'AUTH_FORBIDDEN');
    }

    // 1. Encontrar ou criar o grupo primário
    let group = await this.db.fieldGroup.findFirst({
      where: { postTypeId, title: 'Campos Customizados' }
    });

    if (!group) {
      group = await this.db.fieldGroup.create({
        data: {
          title: 'Campos Customizados',
          postTypeId,
          locationRules: {}
        }
      });
    }

    const groupId = group.id;

    // 2. Obter campos atuais
    const currentFields = await this.db.field.findMany({
      where: { fieldGroupId: groupId }
    });

    const fieldsToKeep = fieldData.filter(f => f.id);
    const fieldIdsToKeep = fieldsToKeep.map(f => f.id);

    // 3. Remover campos que não estão no novo conjunto
    await this.db.field.deleteMany({
      where: {
        fieldGroupId: groupId,
        id: { notIn: fieldIdsToKeep }
      }
    });

    // 4. Upsert dos campos
    for (const f of fieldData) {
      if (f.id) {
        // Update
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
        // Create
        await this.db.field.create({
          data: {
            fieldGroupId: groupId,
            label: f.label,
            name: f.name,
            type: f.type,
            config: f.config || {}
          }
        });
      }
    }

    return await this.listByPostType(postTypeId);
  }

  async deleteFieldGroup(id: string, user: any) {
    if (!canPerformAction(user, 'post.manage')) {
      throw new BlackLotusCMSError('No permission to delete field groups', 403, 'AUTH_FORBIDDEN');
    }

    const deleted = await this.db.fieldGroup.delete({ where: { id } });
    this.log.warn(`Field group deleted: ${deleted.title}`, { id });
    return deleted;
  }

  // --- Static Proxy ---
  static async createFieldGroup(data: any, user: any) { return fieldService.createFieldGroup(data, user); }
  static async validateMetaFields(postTypeId: string, metaFields: any) { return fieldService.validateMetaFields(postTypeId, metaFields); }
  static async listByPostType(postTypeId: string) { return fieldService.listByPostType(postTypeId); }
  static async syncFields(postTypeId: string, fields: any[], user: any) { return fieldService.syncFields(postTypeId, fields, user); }
  static async deleteFieldGroup(id: string, user: any) { return fieldService.deleteFieldGroup(id, user); }
}

export const fieldService = new FieldService();
