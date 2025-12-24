import { Decimal } from '@prisma/client/runtime/library';

export function serializeDecimal(value: Decimal | null | undefined): number | null {
  if (!value) return null;
  return value.toNumber();
}

export function serializeDecimals<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fields) {
    const value = result[field];
    if (value && typeof value === 'object' && 'toNumber' in value) {
      (result[field] as any) = (value as Decimal).toNumber();
    }
  }
  return result;
}
