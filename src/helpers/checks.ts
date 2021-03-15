export function isEmpty<T>(arr: Array<T>): boolean {
  return arr.length === 0;
}

export function isUndefined(arg: unknown): arg is undefined {
  return arg === undefined;
}
