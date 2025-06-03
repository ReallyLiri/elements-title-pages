import { Tooltip } from "react-tooltip";
import styled from "@emotion/styled";

export const TOOLTIP_RESET = "reset";
export const TOOLTIP_ZOOMIN = "zoomin";
export const TOOLTIP_ZOOMOUT = "zoomout";
export const TOOLTIP_CLOSE_CITY_DETAILS = "close-city-details";
export const TOOLTIP_CLOSE_RECORD_DETAILS = "close-record-details";
export const TOOLTIP_FILTERS_HIDE = "filters-hide";
export const TOOLTIP_FILTERS_SHOW = "filters-show";
export const TOOLTIP_TIMELINE_BUTTON = "timeline-button";
export const TOOLTIP_HELP = "help";
export const TOOLTIP_MARKER_ARROW = "marker-arrow";

const LimitedWidthDiv = styled.div`
  max-width: 256px;
  text-align: justify;
`;

export const Tooltips = () => (
  <>
    <Tooltip id={TOOLTIP_RESET} />
    <Tooltip id={TOOLTIP_ZOOMIN} />
    <Tooltip id={TOOLTIP_ZOOMOUT} />
    <Tooltip id={TOOLTIP_CLOSE_CITY_DETAILS} />
    <Tooltip id={TOOLTIP_CLOSE_RECORD_DETAILS} />
    <Tooltip id={TOOLTIP_FILTERS_HIDE} />
    <Tooltip id={TOOLTIP_FILTERS_SHOW} offset={32} />
    <Tooltip id={TOOLTIP_TIMELINE_BUTTON} />
    <Tooltip id={TOOLTIP_HELP} />
    <Tooltip anchorSelect={`#${TOOLTIP_MARKER_ARROW}`} offset={-14}>
      <LimitedWidthDiv>
        Marker placement is for representation purposes and does not reflect the
        actual northeastern location on the Asian continent.
      </LimitedWidthDiv>
    </Tooltip>
  </>
);
