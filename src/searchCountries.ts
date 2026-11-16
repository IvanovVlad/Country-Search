import type { Country } from "./types.ts";

export type SearchByNameResponse = Country[];

export const prepareSearchString = (query: string): string => {
  throw new Error(`Not implemented ${query}`);
};

export const searchCountries = async (
  query: string,
  signal?: AbortSignal,
): Promise<SearchByNameResponse> => {
  const preparedQuery = query.trim();
  if (!preparedQuery) return [];
  return fetch(`https://countries.dev/name/${preparedQuery}`, {
    signal,
  })
    .then(async (r) => {
      const response: SearchByNameResponse = await r.json();
      return response;
    })
    .catch((e: Response) => {
      if (signal?.aborted) {
        throw new Error("AbortError");
      }
      if ([400, 404, 429, 500, 503].includes(e.status)) {
        return [];
      }
      throw new Error("Failed to fetch api");
    });
};
