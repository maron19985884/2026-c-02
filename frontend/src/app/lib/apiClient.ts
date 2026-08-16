const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function fetchJson<T>(path: string): Promise<T | null> {
  const response = await fetch(`${BASE_URL}${path}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${path}`);
  }

  return (await response.json()) as T;
}
