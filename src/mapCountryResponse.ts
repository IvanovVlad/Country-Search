import type { Country } from "./types.ts";

export type UiCard = {
  name: string;
  capital?: string;
  region: string;
  population?: number;
  languages: string[];
};

export const mapCountryResponse = (country: Country): UiCard => {
  return {
    name: country.name,
    capital: country.capital,
    region: country.region,
    population: country.population,
    languages:
      country.languages?.reduce((acc, l) => {
        if (l.name) {
          acc.push(l.name);
        }
        return acc;
      }, [] as string[]) || [],
  };
};
