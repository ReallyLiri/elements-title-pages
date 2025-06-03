import {
  ComposableMap,
  Geographies,
  Geography,
  Point,
  ZoomableGroup,
} from "react-simple-maps";
import { ReactElement } from "react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json";

type MapProps = {
  height: number;
  width: number;
  zoom: number;
  position: Point;
  setPosition: React.Dispatch<React.SetStateAction<Point>>;
  markers: ReactElement;
};

export const MAX_ZOOM = 10;
export const DEFAULT_POSITION: Point = [3.3, 45];

export const CitiesMap = ({
  height,
  width,
  zoom,
  position,
  setPosition,
  markers,
}: MapProps) => (
  <ComposableMap
    height={height}
    width={width}
    projection="geoAzimuthalEqualArea"
    projectionConfig={{
      rotate: [-40.0, -48.0, 0],
      scale: 2200,
    }}
  >
    <ZoomableGroup
      zoom={zoom}
      maxZoom={MAX_ZOOM}
      center={position}
      onMoveEnd={(e) => setPosition(e.coordinates)}
    >
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography key={geo.rsmKey} geography={geo} />
          ))
        }
      </Geographies>
      {markers}
    </ZoomableGroup>
  </ComposableMap>
);
