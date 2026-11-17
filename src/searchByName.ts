import type { Country } from "./types.ts";
import { HttpError } from "./exceptions/HttpError.ts";

export type SearchByNameResponse = Country[];

export const prepareSearchString = (query: string): string => {
  return encodeURIComponent(query.trim());
};

export const searchByName = async (
  query: string,
  signal?: AbortSignal,
): Promise<SearchByNameResponse> => {
  const preparedQuery = prepareSearchString(query);
  if (!preparedQuery) return [];

  const timeoutSignal: AbortSignal = AbortSignal.timeout(1500);
  const signals = [timeoutSignal];
  if (signal) {
    signals.push(signal);
  }
  return fetch(`https://countries.dev/name/${preparedQuery}`, {
    signal: AbortSignal.any(signals),
  })
    .then(async (r) => {
      if (r.ok) {
        const response: SearchByNameResponse = await r.json();
        return response;
      }

      if (r.status === 404) {
        return [] as SearchByNameResponse;
      }

      throw new HttpError(r.status, r.statusText);
    })
    .catch((e: Error) => {
      if (e.name === "TimeoutError") {
        throw e;
      }
      if (e.name === "AbortError") {
        throw e;
      }

      if (e instanceof HttpError) {
        e.message = `Failed to fetch api: ${e.statusCode} ${e.message}`;
        throw e;
      }

      throw new Error("Failed to fetch api");
    });
};
