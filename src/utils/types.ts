/**
 * Type for a record with at least one key.
 * @see https://github.com/reduxjs/redux-toolkit/issues/1423#issuecomment-902680573
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript/#payload-with-all-optional-fields
 */
export type AtLeastOne<T extends Record<string, unknown>> = keyof T extends infer K
  ? K extends string
    ? Pick<T, K & keyof T> & Partial<T>
    : never
  : never;

/**
 * Identity function for prettier-plugin-tailwindcss.
 * @see https://github.com/tailwindlabs/prettier-plugin-tailwindcss?tab=readme-ov-file#sorting-classes-in-template-literals
 * @see https://github.com/tailwindlabs/prettier-plugin-tailwindcss/issues/268#issuecomment-2096059767
 * @param strings
 * @param values
 * @returns The same strings and values as the input
 */
export const tw = (strings: TemplateStringsArray, ...values: unknown[]) => String.raw({ raw: strings }, ...values);
