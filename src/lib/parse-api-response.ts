/** Parse JSON from fetch; surface non-JSON error bodies. */
export async function parseApiResponse<T = Record<string, unknown>>(
  res: Response
): Promise<T & { error?: string }> {
  const text = await res.text();
  if (!text) return {} as T & { error?: string };
  try {
    return JSON.parse(text) as T & { error?: string };
  } catch {
    return { error: res.ok ? "Invalid response" : text || res.statusText } as T & {
      error?: string;
    };
  }
}
