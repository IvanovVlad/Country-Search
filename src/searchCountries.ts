import type { Country } from "./types.ts";

export type SearchByNameResponse = Country[];

export const searchCountries = async (
  query: string,
  signal?: AbortSignal,
): Promise<SearchByNameResponse> => {
  throw new Error(`Not implemented ${query} ${signal}`);
};
