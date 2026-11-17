import { debounce } from "./debounce.ts";
import { searchByName, type SearchByNameResponse } from "./searchByName.ts";

export const searchCountry = (
  notifyResponseChange: (response: SearchByNameResponse) => void,
  notifyError?: (error: Error) => void,
) => {
  let abortController = new AbortController();
  let response: SearchByNameResponse = [];

  const debounced = debounce<[string], Promise<SearchByNameResponse | void>>(
    (...args) =>
      searchByName(args[0], abortController.signal)
        .then((r) => {
          response = r;
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
