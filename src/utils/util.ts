import { reduce } from "lodash";

export const groupByMap = <TFrom, TKey extends string, TValue>(
  data: TFrom[],
  keyBy: (entry: TFrom) => TKey,
  valueBy: ((entry: TFrom) => TValue) | undefined = undefined,
): Record<TKey, TValue> => {
  return reduce(
    data,
    (acc, entry) => ({
      ...acc,
      [keyBy(entry)]: valueBy ? valueBy(entry) : entry,
    }),
    {} as Record<TKey, TValue>,
  );
};
