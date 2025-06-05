import styled from "@emotion/styled";
import { LuFilter } from "react-icons/lu";
import { useFilter } from "../../contexts/FilterContext";
import { TOOLTIP_FILTERS } from "../map/MapTooltips";

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
      onClick={() => setFilterOpen((f) => !f)}
      data-tooltip-id={TOOLTIP_FILTERS}
      data-tooltip-content={filterOpen ? "Hide Filters" : "Show Filters"}
    >
      <LuFilter />
    </FilterButtonContainer>
  );
};
