export interface ValidationFieldErrors {
  customerName?: 'REQUIRED';
  address?: 'REQUIRED';
  email?: 'REQUIRED' | 'INVALID_FORMAT';
  items?: 'EMPTY';
}

export interface OrderValidationInput {
  customerName: unknown;
  address: unknown;
  email: unknown;
  items: unknown;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

export function validateOrderInput(input: OrderValidationInput): ValidationFieldErrors {
  const errors: ValidationFieldErrors = {};

  if (!isNonEmptyString(input.customerName)) {
    errors.customerName = 'REQUIRED';
  }
  if (!isNonEmptyString(input.address)) {
    errors.address = 'REQUIRED';
  }
  if (!isNonEmptyString(input.email)) {
    errors.email = 'REQUIRED';
  } else if (!EMAIL_REGEX.test(input.email)) {
    errors.email = 'INVALID_FORMAT';
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    errors.items = 'EMPTY';
  }

  return errors;
}

export function hasValidationErrors(errors: ValidationFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
