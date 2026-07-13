import { z } from 'zod';

export const FieldTypeEnum = z.enum([
  'text', 'number', 'textarea', 'email', 'image', 'gallery', 'file', 'boolean', 'select', 'repeater', 'json', 'wysiwyg', 'tab', 'section'
]);

export const ConditionalOperatorEnum = z.enum([
  'equals', 'not_equals', 'contains', 'not_contains', 'regex', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'
]);

export const ConditionalRuleSchema = z.object({
  field: z.string(), // Nome do campo a ser monitorado
  operator: ConditionalOperatorEnum,
  value: z.any().optional(),
});

export const FieldConfigSchema = z.object({
  required: z.boolean().optional().default(false),
  placeholder: z.string().optional(),
  defaultValue: z.any().optional(),
  instructions: z.string().optional(),
  
  // Layout
  width: z.number().min(0).max(100).optional().default(100), // Porcentagem (ex: 50 para metade)
  
  // Validação Geral
  validation: z.object({
    min: z.number().optional(), // Para números ou limite de caracteres
    max: z.number().optional(),
    pattern: z.string().optional(), // Regex
  }).optional(),

  // Lógica Condicional
  conditionalLogic: z.object({
    status: z.boolean().optional().default(false),
    relation: z.enum(['and', 'or']).optional().default('and'),
    rules: z.array(ConditionalRuleSchema).optional().default([]),
  }).optional(),

  // Específicos para Select
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),

  // Específicos para Repeater
  repeater: z.object({
    minItems: z.number().optional(),
    maxItems: z.number().optional(),
    layout: z.enum(['table', 'block']).optional().default('block'),
    buttonLabel: z.string().optional().default('Adicionar Item'),
    fields: z.array(z.lazy(() => CreateFieldSchema)).optional(), // Campos internos do repetidor
  }).optional(),
});

export const CreateFieldSchema: z.ZodType<any> = z.object({
  name: z.string().min(2).regex(/^[a-z0-9_]+$/, "Nome do campo deve ser snake_case."),
  label: z.string().min(2),
  type: FieldTypeEnum,
  config: FieldConfigSchema.optional().default({ required: false, width: 100 }),
});

export const LocationTypeEnum = z.enum([
  'post_type', 'taxonomy', 'post', 'template', 'post_status'
]);

export const LocationRuleSchema = z.object({
  type: LocationTypeEnum,
  value: z.string().min(1),
  param: z.string().nullish(),
});

export const CreateFieldGroupSchema = z.object({
  title: z.string().min(2),
  locations: z.array(LocationRuleSchema).min(1, "Pelo menos uma localização é obrigatória"),
  fields: z.array(CreateFieldSchema),
});

export type CreateFieldGroupInput = z.infer<typeof CreateFieldGroupSchema>;
export type FieldConfig = z.infer<typeof FieldConfigSchema>;
export type ConditionalRule = z.infer<typeof ConditionalRuleSchema>;
export type LocationRule = z.infer<typeof LocationRuleSchema>;
