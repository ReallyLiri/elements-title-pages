import { useEffect, useMemo, useState } from "react";
import { Point } from "react-simple-maps";
import styled from "@emotion/styled";
import { isArray, isEmpty, isNil } from "lodash";
import { CityMarkers } from "../components/map/Markers";
import { MapControls } from "../components/map/MapControls";
import { useElementSize } from "../utils/useElementSize";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import {
  LAND_COLOR,
  PANE_BORDER,
  PANE_COLOR,
  PANE_COLOR_ALT,
  SEA_COLOR,
  TRANSPARENT_WHITE,
} from "../utils/colors";
import { MdClose, MdDoubleArrow } from "react-icons/md";
import {
  TOOLTIP_CLOSE_CITY_DETAILS,
  TOOLTIP_CLOSE_RECORD_DETAILS,
  TOOLTIP_FILTERS_HIDE,
  TOOLTIP_FILTERS_SHOW,
} from "../components/map/Tooltips";
import {
  CitiesMap,
  DEFAULT_POSITION,
  MAX_ZOOM,
} from "../components/map/CitiesMap";
import { Timeline } from "../components/map/Timeline";
import { HeatLegend } from "../components/map/HeatMap";
import { FiltersGroup } from "../components/map/FiltersGroup";
import { FilterValue } from "../components/map/Filter";
import { CityDetails } from "../components/map/CityDetails";
import { RecordDetails } from "../components/map/RecordDetails";
import { COLLAPSE_FILTER_BUTTON_ID } from "../components/map/Tour";
import { useTour } from "@reactour/tour";
import { FLOATING_CITY, Item } from "../types";
import { loadCitiesAsync, loadEditionsData } from "../utils/dataUtils.ts";
import { NAVBAR_HEIGHT } from "../components/layout/Navigation.tsx";

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: calc(100vh - ${NAVBAR_HEIGHT}px);
  width: 100%;
  color: black;
  overflow: hidden;
`;

const MapWrapper = styled.div`
  height: calc(100vh - ${NAVBAR_HEIGHT}px);
  width: 100%;

  svg {
    display: inline-block;
    vertical-align: middle;
    background-color: ${SEA_COLOR};
  }

  path {
    fill: ${LAND_COLOR};
  }
`;

const ControlsRow = styled.div`
  position: relative;
  left: 2rem;
  bottom: 4rem;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
`;

const MapSection = styled.div`
  width: 100%;
  height: 100vh;
`;

const ExpandFiltersButton = styled.div`
  position: relative;
  width: fit-content;
  height: 0;
  left: 1rem;
  top: 1rem;
  font-size: 1.5rem;
  cursor: pointer;

  svg {
    background-color: ${TRANSPARENT_WHITE};
    border-radius: 20%;
    color: ${SEA_COLOR};
  }
`;

const CollapseFiltersButton = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 20%;
  background-color: ${TRANSPARENT_WHITE};
  color: ${SEA_COLOR};
  align-self: start;
  margin-bottom: 2px;
`;

const MdDoubleArrowFlipped = styled(MdDoubleArrow)`
  transform: rotate(180deg);
`;

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
`;

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

const Map = () => {
  const { height } = useWindowSize();
  const [data, setData] = useState<Item[]>([]);
  const [cities, setCities] = useState<Record<string, Point>>({});
  const [zoom, setZoom] = useLocalStorage<number>("zoom", 1);
  const {
    ref: mapSectionRef,
    size: { width: mapWidth },
    location: [mapX],
    refresh: refreshSize,
  } = useElementSize();
  const [position, setPosition] = useLocalStorage<Point>(
    "map-position",
    DEFAULT_POSITION,
  );
  const [selectedCity, setSelectedCity] = useLocalStorage<string | undefined>(
    "map-selected-city",
    undefined,
  );
  const [selectedRecordKey, setSelectedRecordId] = useLocalStorage<
    string | undefined
  >("map-selected-record", undefined);
  const [filterOpen, setFilterOpen] = useLocalStorage<boolean>(
    "map-filters-open",
    true,
  );
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [filters, setFilters] = useLocalStorage<
    Record<string, FilterValue[] | undefined>
  >("map-filters", {});
  const [filtersInclude, setFiltersInclude] = useLocalStorage<
    Record<string, boolean>
  >("map-filter-include", {});
  const [toured, setToured] = useLocalStorage<boolean>("map-toured", false);
  const { setIsOpen: setTourOpen } = useTour();

  useEffect(() => {
    if (!toured) {
      setToured(true);
      setTourOpen(true);
    }
  }, [setTourOpen, setToured, toured]);

  useEffect(() => {
    loadEditionsData(setData);
    loadCitiesAsync().then(setCities);
  }, []);

  const [minYear, maxYear] = useMemo(() => {
    const years = data
      .filter((t) => !!t.year)
      .map((t) => parseInt(t.year!.split("/")[0]));
    return [Math.min(...years), Math.max(...years)];
  }, [data]);

  const filteredItems = useMemo(
    () =>
      data.filter((t) =>
        filterRecord(t, range, filters, filtersInclude, maxYear),
      ),
    [data, range, filters, filtersInclude],
  );

  const itemsByCity: Record<string, Item[]> = useMemo(() => {
    const res = {} as Record<string, Item[]>;
    filteredItems.forEach((item) => {
      item.cities.forEach((city) => {
        if (!res[city]) {
          res[city] = [];
        }
        res[city].push(item);
      });
    });
    return res;
  }, [filteredItems]);

  const selectedRecord = useMemo(
    () =>
      selectedRecordKey
        ? data.filter((d) => d.key === selectedRecordKey)[0]
        : undefined,
    [data, selectedRecordKey],
  );

  useEffect(() => {
    refreshSize();
  }, [refreshSize, selectedCity, selectedRecordKey, filterOpen]);

  return (
    <Wrapper>
      {filterOpen && (
        <Pane borderRight={true} widthPercentage={16}>
          <CollapseFiltersButton
            id={COLLAPSE_FILTER_BUTTON_ID}
            onClick={() => setFilterOpen(false)}
            data-tooltip-id={TOOLTIP_FILTERS_HIDE}
            data-tooltip-content="Hide Filters"
          >
            <MdDoubleArrowFlipped />
          </CollapseFiltersButton>
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
      )}
      <MapSection ref={mapSectionRef}>
        {!filterOpen && (
          <ExpandFiltersButton
            onClick={() => setFilterOpen(true)}
            data-tooltip-id={TOOLTIP_FILTERS_SHOW}
            data-tooltip-content="Show Filters"
          >
            <MdDoubleArrow />
          </ExpandFiltersButton>
        )}
        <MapWrapper>
          <CitiesMap
            height={height}
            width={mapWidth}
            zoom={zoom}
            position={position}
            setPosition={setPosition}
            markers={
              <CityMarkers
                cities={cities}
                data={itemsByCity}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
              />
            }
          />
        </MapWrapper>
        <ControlsRow>
          <MapControls
            setZoom={setZoom}
            maxZoom={MAX_ZOOM}
            resetCenter={() => {
              setPosition(DEFAULT_POSITION);
              setZoom(1);
            }}
            openTour={() => setTourOpen(true)}
          />
          <div />
          <Timeline
            minYear={minYear}
            maxYear={maxYear}
            rangeChanged={(from, to) => setRange([from, to])}
          />
        </ControlsRow>
        <HeatLegend
          offsetRight={mapX + mapWidth}
          total={filteredItems?.length || 0}
        />
      </MapSection>
      {!isEmpty(selectedCity) && (
        <Pane borderRight={false} backgroundColor={PANE_COLOR_ALT}>
          <CollapseFiltersButton
            onClick={() => setSelectedCity(undefined)}
            data-tooltip-id={TOOLTIP_CLOSE_CITY_DETAILS}
            data-tooltip-content="Close"
          >
            <MdClose />
          </CollapseFiltersButton>
          <CityDetails
            city={selectedCity!}
            data={itemsByCity[selectedCity!]}
            selectedRecordId={selectedRecordKey}
            setSelectedRecordKey={setSelectedRecordId}
          />
        </Pane>
      )}
      {!isEmpty(selectedRecord) && (
        <Pane borderRight={false} widthPercentage={20}>
          <CollapseFiltersButton
            onClick={() => setSelectedRecordId(undefined)}
            data-tooltip-id={TOOLTIP_CLOSE_RECORD_DETAILS}
            data-tooltip-content="Close"
          >
            <MdClose />
          </CollapseFiltersButton>
          <RecordDetails data={selectedRecord} />
        </Pane>
      )}
    </Wrapper>
  );
};

export default Map;
