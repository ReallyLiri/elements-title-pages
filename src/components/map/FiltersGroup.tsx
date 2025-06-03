import React, { useMemo } from "react";
import { isNil, startCase, uniq } from "lodash";
import { Filter, FilterValue } from "./Filter";
import { FILTER_INDEXED_ID } from "./Tour";
import { FLOATING_CITY, Item } from "../../types";

type FilterConfig = {
  isArray?: boolean;
  displayName?: string;
  customCompareFn?: (a: unknown, b: unknown) => number;
};

type FiltersGroupProps = {
  data: Item[];
  fields: Partial<Record<keyof Item, FilterConfig>>;
  filters: Record<string, FilterValue[] | undefined>;
  setFilters: React.Dispatch<
    React.SetStateAction<Record<string, FilterValue[] | undefined>>
  >;
  filtersInclude: Record<string, boolean>;
  setFiltersInclude: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
};

const toOption = (v: string) => ({ label: v, value: v });

export const FiltersGroup = ({
  data,
  fields,
  filters,
  setFilters,
  filtersInclude,
  setFiltersInclude,
}: FiltersGroupProps) => {
  const keys = Object.keys(fields).map((field) => field as keyof Item);
  const optionsByFilter = useMemo(() => {
    const byFilter: Record<string, FilterValue[]> = {};
    keys.forEach((field) => {
      const config = fields[field]!;
      if (config.isArray) {
        byFilter[field] = uniq(
          data
            .flatMap((t) => t[field] as (string | number)[])
            .filter(Boolean)
            .sort(
              config.customCompareFn ||
                ((a, b) => (a as number) - (b as number)),
            )
            .map((n) => n.toString()),
        ).map(toOption);
      } else {
        byFilter[field] = uniq(
          data
            .map((t) => t[field]?.toString() || "")
            .filter((v) => v && v !== FLOATING_CITY)
            .sort(config.customCompareFn),
        ).map(toOption);
      }
    });
    return byFilter;
  }, [data, fields, keys]);

  return (
    <>
      {keys.map((field, index) => (
        <Filter
          id={`${FILTER_INDEXED_ID}${index}`}
          field={field}
          key={field}
          label={fields[field]?.displayName || startCase(field)}
          value={filters[field]}
          setValue={(values) =>
            setFilters((f) => ({
              ...f,
              [field]: values ? [...values] : undefined,
            }))
          }
          options={optionsByFilter[field]}
          include={isNil(filtersInclude[field]) ? true : filtersInclude[field]}
          setInclude={(include) =>
            setFiltersInclude((f) => ({ ...f, [field]: include }))
          }
        />
      ))}
    </>
  );
};
