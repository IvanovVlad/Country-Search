import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { debounce } from "../src/debounce";

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
});
