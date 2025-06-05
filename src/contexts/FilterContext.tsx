import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Item } from "../types";
import { FilterValue } from "../components/map/Filter";
import { useLocalStorage } from "usehooks-ts";
import { isEmpty, isNil, isArray } from "lodash";
import { loadCitiesAsync, loadEditionsData } from "../utils/dataUtils";
import { Point } from "react-simple-maps";
import { FLOATING_CITY } from "../types";
import { MAX_YEAR, MIN_YEAR } from "../constants";

type FilterContextType = {
  data: Item[];
  cities: Record<string, Point>;
  filteredItems: Item[];
  filters: Record<string, FilterValue[] | undefined>;
  setFilters: React.Dispatch<
    React.SetStateAction<Record<string, FilterValue[] | undefined>>
  >;
  filtersInclude: Record<string, boolean>;
  setFiltersInclude: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  range: [number, number];
  setRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  filterOpen: boolean;
  setFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  minYear: number;
  maxYear: number;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
};

const filterRecord = (
  t: Item,
  range: [number, number],
  filters: Record<string, FilterValue[] | undefined>,
  filtersInclude: Record<string, boolean>,
  maxYear: number,
): boolean => {
  const year = t.year ? parseInt(t.year.split("/")[0]) : null;
  if (
    range[0] > 0 &&
    range[1] > 0 &&
    ((year && year < range[0]) || (year && year > range[1]))
  ) {
    return false;
  }
  if (!t.year && range[1] < maxYear) {
    return false;
  }
  const fields = Object.keys(filters) as (keyof Item)[];
  return fields.every((field) => {
    if (field === "year" && t.cities.includes(FLOATING_CITY)) {
      return false;
    }
    const filterValues = filters[field]?.map((v) => v.value);
    if (isEmpty(filterValues)) {
      return true;
    }
    const fieldValue = t[field];
    const match = isArray(fieldValue)
      ? filterValues!.some(
          (v) =>
            fieldValue.includes(parseInt(v) as never) ||
            fieldValue.includes(v?.toString() as never),
        )
      : filterValues!.includes(fieldValue?.toString() || "");
    const include = isNil(filtersInclude[field]) ? true : filtersInclude[field];
    return include ? match : !match;
  });
};

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Item[]>([]);
  const [cities, setCities] = useState<Record<string, Point>>({});
  const [range, setRange] = useLocalStorage<[number, number]>("time-range", [
    MIN_YEAR,
    MAX_YEAR,
  ]);
  const [filters, setFilters] = useLocalStorage<
    Record<string, FilterValue[] | undefined>
  >("filters", {
    type: [
      {
        label: "Elements",
        value: "Elements",
      },
    ],
  });
  const [filtersInclude, setFiltersInclude] = useLocalStorage<
    Record<string, boolean>
  >("filter-include", {});
  const [filterOpen, setFilterOpen] = useLocalStorage<boolean>(
    "filters-open",
    true,
  );

  useEffect(() => {
    loadEditionsData(setData, true);
    loadCitiesAsync().then(setCities);
  }, []);

  const [minYear, maxYear] = useMemo(() => {
    const years = data
      .filter((t) => !!t.year)
      .map((t) => parseInt(t.year!.split("/")[0]));
    return [Math.min(...years) || MIN_YEAR, Math.max(...years) || MAX_YEAR];
  }, [data]);

  const filteredItems = useMemo(
    () =>
      data.filter((t) =>
        filterRecord(t, range, filters, filtersInclude, maxYear),
      ),
    [data, range, filters, filtersInclude, maxYear],
  );

  const value = {
    data,
    cities,
    filteredItems,
    filters,
    setFilters,
    filtersInclude,
    setFiltersInclude,
    range,
    setRange,
    filterOpen,
    setFilterOpen,
    minYear,
    maxYear,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};
