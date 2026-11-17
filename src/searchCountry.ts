import { debounce } from "./debounce.ts";
import { searchByName } from "./searchByName.ts";
import type { Country } from "./types.ts";
import { mapCountryResponse, type UiCard } from "./mapCountryResponse.ts";

export type SearchCountryResponse = { country: Country; card: UiCard }[];

export const searchCountry = (
  notifyResponseChange: (response: SearchCountryResponse) => void,
  notifyError?: (error: Error) => void,
) => {
  let abortController = new AbortController();
  let response: { country: Country; card: UiCard }[] = [];

  const debounced = debounce<[string], Promise<SearchCountryResponse | void>>(
    (...args) =>
      searchByName(args[0], abortController.signal)
        .then((r) => {
          response = r.map((country) => ({
            country,
            card: mapCountryResponse(country),
          }));
          notifyResponseChange(response);
          return response;
        })
        .catch((e: Error) => {
          if (e.name !== "AbortError") {
            notifyError?.(e);
          }
        }),
    1000,
  );

  const execute = (query: string) => {
    abortController.abort();
    abortController = new AbortController();
    return debounced(query);
  };

  return {
    execute,
  };
};
