export type AtLeastOne<T extends Record<string, unknown>> = keyof T extends infer K
  ? K extends string
    ? Pick<T, K & keyof T> & Partial<T>
    : never
  : never;
