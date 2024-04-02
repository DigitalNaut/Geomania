export type Required<T, K extends keyof T> = {
  [P in K]-?: T[P];
};
