/** Normalize NIC for storage and lookup: uppercase, no spaces or dashes. */
export function normalizeNic(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]/g, "");
}

export function isEmailIdentifier(value: string): boolean {
  return value.includes("@");
}
