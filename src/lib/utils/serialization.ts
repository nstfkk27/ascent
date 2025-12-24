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
    if (result[field] instanceof Decimal) {
      (result[field] as any) = (result[field] as Decimal).toNumber();
    }
  }
  return result;
}
