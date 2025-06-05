import styled from "@emotion/styled";
import { LuFilter } from "react-icons/lu";
import { SEA_COLOR } from "../../utils/colors";
import { useFilter } from "../../contexts/FilterContext";
import { TOOLTIP_FILTERS_SHOW, TOOLTIP_FILTERS_HIDE } from "../map/MapTooltips";

const FilterButtonContainer = styled.div`
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
`;

export const FilterButton = () => {
  const { filterOpen, setFilterOpen } = useFilter();

  return (
    <FilterButtonContainer
      onClick={() => setFilterOpen(!filterOpen)}
      data-tooltip-id={filterOpen ? TOOLTIP_FILTERS_HIDE : TOOLTIP_FILTERS_SHOW}
      data-tooltip-content={filterOpen ? "Hide Filters" : "Show Filters"}
    >
      <LuFilter />
    </FilterButtonContainer>
  );
};