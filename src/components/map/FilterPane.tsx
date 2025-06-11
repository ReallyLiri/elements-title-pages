import styled from "@emotion/styled";
import { PANE_BORDER } from "../../utils/colors";
import { FiltersGroup } from "./FiltersGroup";
import { useFilter } from "../../contexts/FilterContext";
import { ScrollbarStyle } from "../common";
import RangeSlider from "../tps/filters/RangeSlider";
import { NAVBAR_HEIGHT } from "../layout/Navigation.tsx";
import { FilterButton } from "../layout/FilterButton.tsx";
import { itemProperties } from "../../constants/itemProperties.ts";

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
        fields={itemProperties}
        filters={filters}
        setFilters={setFilters}
        filtersInclude={filtersInclude}
        setFiltersInclude={setFiltersInclude}
      />
    </Pane>
  );
};
