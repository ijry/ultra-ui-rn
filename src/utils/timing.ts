export function sleep(milliseconds = 30): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function debounce<Args extends unknown[]>(
  callback: (...args: Args) => void,
  wait = 500,
  immediate = false,
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (...args: Args) => {
    const callNow = immediate && timer === undefined;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      if (!immediate) {
        callback(...args);
      }
    }, wait);
    if (callNow) {
      callback(...args);
    }
  };
}

export function throttle<Args extends unknown[]>(
  callback: (...args: Args) => void,
  wait = 500,
  immediate = true,
): (...args: Args) => void {
  let blocked = false;

  return (...args: Args) => {
    if (blocked) {
      return;
    }
    blocked = true;
    if (immediate) {
      callback(...args);
    }
    setTimeout(() => {
      blocked = false;
      if (!immediate) {
        callback(...args);
      }
    }, wait);
  };
}
