import styled from "@emotion/styled";
import { PANE_BORDER, PANE_COLOR } from "../../utils/colors";
import { FiltersGroup } from "./FiltersGroup";
import { useFilter } from "../../contexts/FilterContext";

const Pane = styled.div<{
  borderRight: boolean;
  widthPercentage?: number;
  backgroundColor?: string;
}>`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: calc(100vh - 6rem + 4px);
  width: ${({ widthPercentage }) => widthPercentage || 20}%;
  min-width: 256px;
  overflow-x: auto;
  background-color: ${({ backgroundColor }) => backgroundColor || PANE_COLOR};
  padding: 1rem;
  margin-bottom: 10rem;
  ${({ borderRight }) =>
    borderRight ? "border-right" : "border-left"}: 2px ${PANE_BORDER} solid;
  position: fixed;
  top: 60px;
  left: 0;
  z-index: 100;
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

export const FilterPane = () => {
  const { data, filters, setFilters, filtersInclude, setFiltersInclude, filterOpen } = useFilter();

  if (!filterOpen) return null;

  return (
    <Pane borderRight={true} widthPercentage={16}>
      <FiltersGroup
        data={data}
        fields={{
          cities: {
            isArray: true,
          },
          class: { displayName: "Wardhaugh Class" },
          languages: {
            isArray: true,
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
            customCompareFn: (a, b) =>
              (a as string).localeCompare(b as string),
          },
        }}
        filters={filters}
        setFilters={setFilters}
        filtersInclude={filtersInclude}
        setFiltersInclude={setFiltersInclude}
      />
    </Pane>
  );
};