import { ConditionalRule, FieldConfig } from '@/schemas/field.schema';

/**
 * Evaluates a single conditional rule against current form data.
 */
export function evaluateRule(rule: ConditionalRule, formData: any): boolean {
  const value = formData.metaFields?.[rule.field] ?? formData[rule.field];
  const target = rule.value;

  switch (rule.operator) {
    case 'equals':
      return value === target;
    case 'not_equals':
      return value !== target;
    case 'contains':
      return Array.isArray(value) ? value.includes(target) : String(value).includes(String(target));
    case 'not_contains':
      return Array.isArray(value) ? !value.includes(target) : !String(value).includes(String(target));
    case 'regex':
      try {
        return new RegExp(String(target)).test(String(value));
      } catch {
        return false;
      }
    case 'greater_than':
      return Number(value) > Number(target);
    case 'less_than':
      return Number(value) < Number(target);
    case 'is_empty':
      return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
    case 'is_not_empty':
      return value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0);
    default:
      return true;
  }
}

/**
 * Evaluates the entire set of logic rules for a field.
 */
export function shouldShowField(config: FieldConfig, formData: any): boolean {
  if (!config.conditionalLogic?.status || !config.conditionalLogic.rules?.length) {
    return true;
  }

  const { relation, rules } = config.conditionalLogic;
  
  if (relation === 'or') {
    return rules.some(rule => evaluateRule(rule, formData));
  }
  
  return rules.every(rule => evaluateRule(rule, formData));
}

/**
 * Validates a field's value based on its settings.
 */
export function validateField(field: any, value: any): string | null {
  if (field.type === 'tab' || field.type === 'section') return null;
  const config = field.config as FieldConfig;
  
  if (config.required && (value === undefined || value === null || value === '')) {
    return 'This field is required.';
  }

  if (field.type === 'number') {
    const val = Number(value);
    if (config.validation?.min !== undefined && val < config.validation.min) {
      return `Minimum value is ${config.validation.min}.`;
    }
    if (config.validation?.max !== undefined && val > config.validation.max) {
      return `Maximum value is ${config.validation.max}.`;
    }
  }

  if (field.type === 'text' || field.type === 'textarea') {
    const charCount = String(value).length;
    if (config.validation?.min !== undefined && charCount < config.validation.min) {
      return `Minimum ${config.validation.min} characters required.`;
    }
    if (config.validation?.max !== undefined && charCount > config.validation.max) {
      return `Maximum ${config.validation.max} characters allowed.`;
    }
  }

  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(value))) {
      return 'Invalid email format.';
    }
  }

  if (config.validation?.pattern && value) {
    try {
      const regex = new RegExp(config.validation.pattern);
      if (!regex.test(String(value))) {
        return 'Value does not match the expected format.';
      }
    } catch {
      return 'Invalid validation pattern.';
    }
  }

  if (field.type === 'repeater') {
    const count = Array.isArray(value) ? value.length : 0;
    if (config.repeater?.minItems !== undefined && count < config.repeater.minItems) {
      return `Minimum of ${config.repeater.minItems} items required.`;
    }
    if (config.repeater?.maxItems !== undefined && count > config.repeater.maxItems) {
      return `Maximum of ${config.repeater.maxItems} items allowed.`;
    }
  }

  return null;
}

/**
 * Converts a Prisma MetaValues array into a key-value object.
 */
export function flattenMetadata(metaValues: any[]): Record<string, any> {
  if (!metaValues || !Array.isArray(metaValues)) return {};
  
  return metaValues.reduce((acc, curr) => {
    const key = curr.field?.slug || curr.fieldId;
    acc[key] = curr.value;
    return acc;
  }, {} as Record<string, any>);
}
