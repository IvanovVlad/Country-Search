import { debounce } from "./debounce.ts";
import {
  type SearchByNameResponse,
  searchCountries,
} from "./searchCountries.ts";

export const searchCountry = (
  notifyResponseChange: (response: SearchByNameResponse) => void,
) => {
  let abortController = new AbortController();
  let response: SearchByNameResponse = [];

  const debounced = debounce<[string], Promise<SearchByNameResponse>>(
    (...args) =>
      searchCountries(args[0], abortController.signal).then((r) => {
        response = r;
        notifyResponseChange(response);
        return response;
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
