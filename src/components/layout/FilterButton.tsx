import styled from "@emotion/styled";
import { LuFilter } from "react-icons/lu";
import { useFilter } from "../../contexts/FilterContext";
import { TOOLTIP_FILTERS } from "../map/MapTooltips";
import React, { useRef } from "react";
import { FILTER_TOGGLE_BUTTON_ID } from "../map/Tour.tsx";

const FilterButtonContainer = styled.div`
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  background-color: black;
  padding: 0.5rem;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  width: fit-content;
  svg {
    transform: translateY(2px);
  }
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
      id={FILTER_TOGGLE_BUTTON_ID}
    >
      <LuFilter />
    </FilterButtonContainer>
  );
};
