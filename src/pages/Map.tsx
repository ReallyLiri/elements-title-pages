import { useEffect, useMemo, useState } from "react";
import { Point } from "react-simple-maps";
import styled from "@emotion/styled";
import {
  FLOATING_CITY,
  loadCitiesAsync,
  loadDataAsync,
  Translation,
} from "../utils/data";
import { groupBy, isArray, isEmpty, isNil } from "lodash";
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

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
`;

const MapWrapper = styled.div`
  height: 100%;
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
  height: calc(100vh - 2rem);
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
  t: Translation,
  range: [number, number],
  filters: Record<string, FilterValue[] | undefined>,
  filtersInclude: Record<string, boolean>,
  maxYear: number,
): boolean => {
  if (
    range[0] > 0 &&
    range[1] > 0 &&
    ((t.year && t.year! < range[0]) || t.year! > range[1])
  ) {
    return false;
  }
  if (!t.year && range[1] < maxYear) {
    return false;
  }
  const fields = Object.keys(filters) as (keyof Translation)[];
  return fields.every((field) => {
    if (field === "year" && t.city === FLOATING_CITY) {
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

const bookSizeCompare = (a: string, b: string): number => {
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
  const [data, setData] = useState<Translation[]>([]);
  const [cities, setCities] = useState<Record<string, Point>>({});
  const [zoom, setZoom] = useLocalStorage<number>("zoom", 1);
  const {
    ref: mapSectionRef,
    size: { width: mapWidth },
    location: [mapX],
    refresh: refreshSize,
  } = useElementSize();
  const [position, setPosition] = useLocalStorage<Point>(
    "position",
    DEFAULT_POSITION,
  );
  const [selectedCity, setSelectedCity] = useLocalStorage<string | undefined>(
    "selected-city",
    undefined,
  );
  const [selectedRecordId, setSelectedRecordId] = useLocalStorage<
    string | undefined
  >("selected-record", undefined);
  const [filterOpen, setFilterOpen] = useLocalStorage<boolean>(
    "filters-open",
    true,
  );
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [filters, setFilters] = useLocalStorage<
    Record<string, FilterValue[] | undefined>
  >("filters", {});
  const [filtersInclude, setFiltersInclude] = useLocalStorage<
    Record<string, boolean>
  >("filter-include", {});
  const [toured, setToured] = useLocalStorage<boolean>("toured", false);
  const { setIsOpen: setTourOpen } = useTour();

  useEffect(() => {
    if (!toured) {
      setToured(true);
      setTourOpen(true);
    }
  }, [setTourOpen, setToured, toured]);

  useEffect(() => {
    loadDataAsync().then(setData);
    loadCitiesAsync().then(setCities);
  }, []);

  const [minYear, maxYear] = useMemo(() => {
    const years = data.filter((t) => !!t.year).map((t) => t.year!);
    return [Math.min(...years), Math.max(...years)];
  }, [data]);

  const filteredTranslations = useMemo(
    () =>
      data.filter((t) =>
        filterRecord(t, range, filters, filtersInclude, maxYear),
      ),
    [data, range, filters, filtersInclude],
  );

  const translationByCity: Record<string, Translation[]> = useMemo(
    () => groupBy(filteredTranslations, (t) => t.city),
    [filteredTranslations],
  );

  const selectedRecord = useMemo(
    () =>
      selectedRecordId
        ? data.filter((d) => d.id === selectedRecordId)[0]
        : undefined,
    [data, selectedRecordId],
  );

  useEffect(() => {
    refreshSize();
  }, [refreshSize, selectedCity, selectedRecordId, filterOpen]);

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
              city: {},
              class: { displayName: "Wardhaugh Class" },
              language: {},
              translator: {},
              booksExpanded: { displayName: "Elements Books", isArray: true },
              bookSize: {
                displayName: "Edition Format",
                customCompareFn: bookSizeCompare,
              },
              volumesCount: { displayName: "Number of Volumes" },
              additionalContent: {
                displayName: "Additional Content",
                isArray: true,
                customCompareFn: (a, b) => a.localeCompare(b),
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
                data={translationByCity}
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
          total={filteredTranslations?.length || 0}
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
            data={translationByCity[selectedCity!]}
            selectedRecordId={selectedRecordId}
            setSelectedRecordId={setSelectedRecordId}
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
