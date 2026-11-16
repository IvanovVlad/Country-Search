export const debounce = <T extends unknown[], U>(
  fn: (...args: T) => U,
  delay: number,
): ((...args: T) => void) => {
  let timerId: number | undefined;
  return (...params: T) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...params), delay);
  };
};
