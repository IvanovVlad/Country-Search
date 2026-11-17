import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { debounce } from "../src/debounce";
import {
  prepareSearchString,
  type SearchByNameResponse,
  searchByName,
} from "../src/searchByName";
import { mapCountryResponse } from "../src/mapCountryResponse";
import type { Country } from "../src/types";
import { HttpError } from "../src/exceptions/HttpError";

describe("debounce tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should delay execution and execute provided function", () => {
    const mockCallback = vi.fn();
    const debounceResult = debounce(mockCallback, 100);

    debounceResult();
    debounceResult();

    expect(mockCallback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
  it("should reset execution timer on repeated call", () => {
    const mockCallback = vi.fn();
    const debounceResult = debounce(mockCallback, 100);

    debounceResult();
    vi.advanceTimersByTime(88);
    expect(mockCallback).not.toHaveBeenCalled();
    debounceResult();
    vi.advanceTimersByTime(88);
    expect(mockCallback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(12);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
  it("should delay execution independently", () => {
    const mockCallback1 = vi.fn();
    const mockCallback2 = vi.fn();
    const debounceResult1 = debounce(mockCallback1, 100);
    const debounceResult2 = debounce(mockCallback2, 200);

    debounceResult1();
    debounceResult2();

    vi.advanceTimersByTime(50);
    expect(mockCallback1).not.toHaveBeenCalled();
    expect(mockCallback2).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(mockCallback1).toHaveBeenCalledTimes(1);
    expect(mockCallback2).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockCallback1).toHaveBeenCalledTimes(1);
    expect(mockCallback2).toHaveBeenCalledTimes(1);
  });
  it("should call function with passed args", () => {
    const mockCallback = vi.fn();
    const debounceResult = debounce(mockCallback, 100);
    const args = ["a", "b", "c"];

    debounceResult();
    vi.advanceTimersByTime(10);
    debounceResult(...args);
    vi.advanceTimersByTime(100);

    expect(mockCallback).toHaveBeenCalledOnce();
    expect(mockCallback.mock.calls[0]).toEqual(args);
  });
});

const mockedCountry: Country = {
  name: "Israel",
  topLevelDomain: [".il"],
  alpha2Code: "IL",
  alpha3Code: "ISR",
  callingCodes: ["972"],
  capital: "Jerusalem",
  altSpellings: ["string"],
  subregion: "Western Asia",
  region: "Asia",
  population: 9216900,
  latlng: [31.5, 34.75],
  demonym: "Israeli",
  area: 20770,
  timezones: ["UTC+02:00"],
  borders: ["EGY", "JOR", "LBN", "SYR"],
  nativeName: "ישראל",
  numericCode: "376",
  flags: {
    svg: "http://example.com",
    png: "http://example.com",
  },
  currencies: [
    {
      code: "ILS",
      name: "Israeli new shekel",
      symbol: "₪",
    },
  ],
  languages: [
    {
      iso639_1: "he",
      iso639_2: "heb",
      name: "Hebrew",
      nativeName: "עברית",
    },
  ],
  flag: "🇮🇱",
  maps: {
    googleMaps: "http://example.com",
    openStreetMaps: "http://example.com",
  },
  populationDensity: 443.6,
};

const getCopyOfMockedCountry = () => {
  return structuredClone(mockedCountry);
};

describe("searchCountries tests", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return correct value", async () => {
    const expectedSearchResponse: SearchByNameResponse = [
      getCopyOfMockedCountry(),
    ];
    const fetchStub = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => expectedSearchResponse,
    } as Response);
    vi.stubGlobal("fetch", fetchStub);
    const query = "Israel";

    const response = await searchByName(query);

    expect(fetchStub).toHaveBeenCalledOnce();
    expect(response).toStrictEqual(expectedSearchResponse);
  });

  it("should reject with AbortError when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) =>
        Promise.reject(init.signal?.reason),
      ),
    );

    await expect(searchByName("query", controller.signal)).rejects.toThrow();
  });

  it.each([404])(
    "should return empty array on %i fetch error",
    async (status) => {
      const fetchStub = vi.fn().mockResolvedValue({
        ok: false,
        status,
        json: async () => [],
      } as Response);
      vi.stubGlobal("fetch", fetchStub);

      const response = await searchByName("Israel");

      expect(fetchStub).toHaveBeenCalledOnce();
      expect(response).toEqual([]);
    },
  );

  it.each([400, 429, 500, 503])(
    "should throw error on http error status %i",
    async (status) => {
      const fetchStub = vi.fn().mockResolvedValue({
        ok: false,
        status,
        json: async () => [],
      } as Response);
      vi.stubGlobal("fetch", fetchStub);

      await expect(searchByName("Israel")).rejects.toBeInstanceOf(HttpError);
    },
  );

  describe("should not perform empty string request", () => {
    let fetchStub: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      fetchStub = vi.fn();
      vi.stubGlobal("fetch", fetchStub);
    });

    it("on empty string", async () => {
      const query = "";
      await searchByName(query);

      expect(fetchStub).not.toHaveBeenCalled();
    });

    it("on spaces string", async () => {
      const query = "   ";
      await searchByName(query);

      expect(fetchStub).not.toHaveBeenCalled();
    });
  });

  it("should prepare url path param", async () => {
    const fetchStub = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    } as Response);
    vi.stubGlobal("fetch", fetchStub);
    const pathParam = " abc/ ";
    const pathParamExpected = "abc%2F";

    await searchByName(pathParam);
    const usedFetchUrl = fetchStub.mock.calls[0][0];

    expect(usedFetchUrl).include(pathParamExpected);
  });

  describe("prepare path parameter", () => {
    it("should trim query", () => {
      const expected = "abc";
      const initial = " abc ";

      const result = prepareSearchString(initial);

      expect(result).toBe(expected);
    });
    it("should encode / and other special characters", () => {
      const initial = " abc / . ?";
      const expected = "abc%20%2F%20.%20%3F";

      const result = prepareSearchString(initial);

      expect(result).toBe(expected);
    });
  });
});

describe("mapCountryResponse tests", () => {
  it("should resolve fields correctly", () => {
    const mockedCountry: Country = getCopyOfMockedCountry();

    const cardData = mapCountryResponse(mockedCountry);

    expect(cardData.capital).toBe(mockedCountry.capital);
    expect(cardData.languages).toEqual(
      mockedCountry.languages?.map((l) => l.name),
    );
    expect(cardData.name).toBe(mockedCountry.name);
    expect(cardData.population).toBe(mockedCountry.population);
    expect(cardData.region).toBe(mockedCountry.region);
    expect(cardData.flag).toBe(mockedCountry?.flags?.png);
  });
});
