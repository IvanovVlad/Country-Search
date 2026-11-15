import type { Country } from "./types.ts";

export type UiCard = {
  name: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
};

export const mapCountryResponse = (country: Country): UiCard => {
  throw new Error(`Not implemented ${country}`);
};
