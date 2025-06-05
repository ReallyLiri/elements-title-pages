import styled from "@emotion/styled";
import { PANE_BORDER } from "../../utils/colors";
import { FiltersGroup } from "./FiltersGroup";
import { useFilter } from "../../contexts/FilterContext";
import { useEffect, useRef } from "react";
import { FLOATING_CITY } from "../../types";
import RangeSlider from "../tps/filters/RangeSlider";

const Pane = styled.div<{
  borderRight: boolean;
  backgroundColor?: string;
}>`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: calc(100vh - 6rem + 4px);
  width: 20rem;
  max-width: 100vw;
  min-width: 256px;
  overflow-x: auto;
  background-color: white;
  color: black;
  padding: 1rem;
  margin-bottom: 10rem;
  ${({ borderRight }) =>
    borderRight ? "border-right" : "border-left"}: 2px ${PANE_BORDER} solid;
  position: fixed;
  top: 60px;
  left: 0;
  z-index: 100;

  &::-webkit-scrollbar {
    width: 12px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 6px;
    border: 3px solid #f1f1f1;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }

  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
`;

const formatCompare = (a: string, b: string): number => {
  const order = [
    "folio",
    "folio in 8s",
    "quarto",
    "quarto in 8s",
    "sexto",
    "octavo",
    "duodecimo",
    "octodecimo",
  ];
  a = a.toLocaleLowerCase();
  b = b.toLocaleLowerCase();
  const aIndex = order.indexOf(a);
  const bIndex = order.indexOf(b);
  if (aIndex === -1 && bIndex === -1) {
    return a.localeCompare(b);
  } else if (aIndex === -1) {
    return 1;
  } else if (bIndex === -1) {
    return -1;
  } else {
    return aIndex - bIndex;
  }
};

const StyledRangeSlider = styled(RangeSlider)`
  gap: 0.5rem;
  input {
    margin: 0;
  }
`;

export const FilterPane = () => {
  const {
    data,
    filters,
    setFilters,
    filtersInclude,
    setFiltersInclude,
    filterOpen,
    setFilterOpen,
    range,
    setRange,
    minYear,
    maxYear,
  } = useFilter();
  const paneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return false;
      }
      const element =
        target instanceof HTMLElement ? target : target.parentElement;
      if (element?.closest("#filter-toggle-button")) {
        return;
      }
      if (element?.closest("a") || element?.querySelector("a")) {
        return;
      }

      if (
        filterOpen &&
        paneRef.current &&
        !paneRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterOpen, setFilterOpen]);

  if (!filterOpen) return null;

  return (
    <Pane ref={paneRef} borderRight={true} onClick={(e) => e.stopPropagation()}>
      <StyledRangeSlider
        min={minYear}
        max={maxYear}
        value={range}
        onChange={setRange}
      />

      <FiltersGroup
        data={data}
        fields={{
          type: {
            displayName: "Book Classification",
          },
          languages: {
            isArray: true,
          },
          cities: {
            isArray: true,
            customCompareFn: ((a: string, b: string) => {
              if (a === FLOATING_CITY) return -1;
              if (b === FLOATING_CITY) return 1;
              return a.localeCompare(b, undefined, { sensitivity: "base" });
            }) as (a: unknown, b: unknown) => number,
          },
          authors: {
            isArray: true,
          },
          elementsBooksExpanded: {
            displayName: "Elements Books",
            isArray: true,
          },
          format: {
            displayName: "Edition Format",
            customCompareFn: formatCompare as (
              a: unknown,
              b: unknown,
            ) => number,
          },
          volumesCount: { displayName: "Number of Volumes" },
          additionalContent: {
            displayName: "Additional Content",
            isArray: true,
            customCompareFn: (a, b) => (a as string).localeCompare(b as string),
          },
          class: { displayName: "Wardhaugh Class" },
        }}
        filters={filters}
        setFilters={setFilters}
        filtersInclude={filtersInclude}
        setFiltersInclude={setFiltersInclude}
      />
    </Pane>
  );
};
