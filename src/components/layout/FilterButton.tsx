import styled from "@emotion/styled";
import { LuFilter } from "react-icons/lu";
import { useFilter } from "../../contexts/FilterContext";
import { TOOLTIP_FILTERS } from "../map/MapTooltips";
import { useRef } from "react";

const FilterButtonContainer = styled.div`
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
`;

export const FilterButton = () => {
  const { filterOpen, setFilterOpen } = useFilter();
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFilterOpen((f) => !f);
  };

  return (
    <FilterButtonContainer
      ref={buttonRef}
      onClick={handleClick}
      data-tooltip-id={TOOLTIP_FILTERS}
      data-tooltip-content={filterOpen ? "Hide Filters" : "Show Filters"}
      id="filter-toggle-button"
    >
      <LuFilter />
    </FilterButtonContainer>
  );
};