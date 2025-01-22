import type { z } from "zod";

export class LocalStorage<T, S extends z.ZodSchema<T> = z.ZodSchema<T>> {
  key: string;
  schema: S;
  constructor(key: string, schema: S) {
    this.schema = schema;
    this.key = key;
  }

  set(value: T) {
    localStorage.setItem(this.key, JSON.stringify(value));
  }

  clear() {
    localStorage.removeItem(this.key);
  }

  load() {
    const data = localStorage.getItem(this.key) ?? "";

    try {
      if (!data) return undefined;

      const validatedItem = this.schema.parse(JSON.parse(data));

      return validatedItem;
    } catch {
      localStorage.removeItem(this.key);
      return undefined;
    }
  }
}
