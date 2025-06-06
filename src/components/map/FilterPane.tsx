import styled from "@emotion/styled";
import { PANE_BORDER } from "../../utils/colors";
import { FiltersGroup } from "./FiltersGroup";
import { useFilter } from "../../contexts/FilterContext";
import { FLOATING_CITY } from "../../types";
import { ScrollbarStyle } from "../common";
import RangeSlider from "../tps/filters/RangeSlider";
import { NAVBAR_HEIGHT } from "../layout/Navigation.tsx";
import { FilterButton } from "../layout/FilterButton.tsx";

const Pane = styled.div`
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
  border-radius: 0 0.7rem 0.7rem 0.7rem;
  border-right: 2px ${PANE_BORDER} solid;
  border-bottom: 2px ${PANE_BORDER} solid;
  position: fixed;
  top: ${NAVBAR_HEIGHT}px;
  left: 0;
  z-index: 100;

  ${ScrollbarStyle};
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
    range,
    setRange,
    minYear,
    maxYear,
  } = useFilter();
  if (!filterOpen) {
    return null;
  }

  return (
    <Pane onClick={(e) => e.stopPropagation()}>
      <FilterButton />
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
