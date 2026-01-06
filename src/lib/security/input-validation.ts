/**
 * Input Validation & Sanitization Utilities
 * Protects against XSS, injection attacks, and malformed data
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Basic implementation - for production consider using DOMPurify library
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate phone number (international format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove angle brackets to prevent tag injection
}

/**
 * Validate numeric input
 */
export function isValidNumber(value: any, min?: number, max?: number): boolean {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

/**
 * Validate price input (positive number with max 2 decimal places)
 */
export function isValidPrice(price: any): boolean {
  const num = Number(price);
  if (isNaN(num) || num < 0) return false;
  const decimalPlaces = (price.toString().split('.')[1] || '').length;
  return decimalPlaces <= 2;
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}): { valid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;

  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }

  return { valid: true };
}

/**
 * Validate property data
 */
export function validatePropertyData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || data.title.length < 5 || data.title.length > 200) {
    errors.push('Title must be between 5 and 200 characters');
  }

  if (!data.description || data.description.length < 20) {
    errors.push('Description must be at least 20 characters');
  }

  if (!isValidPrice(data.price) || data.price <= 0) {
    errors.push('Price must be a valid positive number');
  }

  if (data.size && (!isValidNumber(data.size, 1, 100000))) {
    errors.push('Size must be between 1 and 100,000 sqm');
  }

  if (data.bedrooms && (!isValidNumber(data.bedrooms, 0, 50))) {
    errors.push('Bedrooms must be between 0 and 50');
  }

  if (data.bathrooms && (!isValidNumber(data.bathrooms, 0, 50))) {
    errors.push('Bathrooms must be between 0 and 50');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate contact form data
 */
export function validateContactData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.length < 2 || data.name.length > 100) {
    errors.push('Name must be between 2 and 100 characters');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('Invalid phone number format');
  }

  if (!data.message || data.message.length < 10 || data.message.length > 2000) {
    errors.push('Message must be between 10 and 2000 characters');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Rate limit key generator
 */
export function getRateLimitKey(identifier: string, action: string): string {
  return `ratelimit:${action}:${identifier}`;
}
