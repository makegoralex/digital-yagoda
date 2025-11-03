export function mapToObject<TValue>(value: unknown): Record<string, TValue> | undefined {
  if (!value) {
    return undefined;
  }
  if (value instanceof Map) {
    return Object.fromEntries(value.entries()) as Record<string, TValue>;
  }
  return value as Record<string, TValue>;
}
