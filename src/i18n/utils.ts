/* eslint-disable @typescript-eslint/no-explicit-any */
export function safeTranslate(t: (key: any) => string, key: string, fallback = '-'): string {
  const result = t(key as any);
  return result !== key ? result : fallback;
}
