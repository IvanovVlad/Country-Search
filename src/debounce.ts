export const debounce = <T extends unknown[], U>(
  fn: (...args: T) => U,
  delay: number,
): ((...args: T) => U) => {
  throw new Error(`${delay} ${fn}`);
};
