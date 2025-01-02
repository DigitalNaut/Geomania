import type { z } from "zod";

export class LocalStorage<T> {
  key: string;
  constructor(key: string) {
    this.key = key;
  }

  set(value: T) {
    localStorage.setItem(this.key, JSON.stringify(value));
  }
  get() {
    return JSON.parse(localStorage.getItem(this.key) ?? "{}");
  }
  clear() {
    localStorage.removeItem(this.key);
  }
  load<T extends z.Schema>(schema: T): ReturnType<T["parse"]> | undefined {
    const data = localStorage.getItem(this.key) ?? "";

    try {
      if (!data) return undefined;

      const validatedItem = schema.parse(JSON.parse(data));

      return validatedItem;
    } catch {
      localStorage.removeItem(this.key);
      return undefined;
    }
  }
}
