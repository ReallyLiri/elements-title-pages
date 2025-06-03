import styled from "@emotion/styled";
import { Link } from "./Link";
import { SEA_COLOR } from "../../utils/colors.ts";

export const COLLAPSE_FILTER_BUTTON_ID = "collapse-filter-btn";
export const FILTER_INDEXED_ID = "filter-";
export const CITY_MARKER_ID = "marker-city-";
export const ZOOM_CONTROLS_ID = "zoom-controls";
export const TIMELINE_RANGE_ID = "range-slider";
export const TIMELINE_PLAY_ID = "timeline-play";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
`;

const Title = styled.div`
  background-color: ${SEA_COLOR};
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  width: fit-content;
`;

export const tourSteps = [
  {
    selector: "body",
    content: (
      <Wrapper>
        <Title>Euclid's Elements</Title>
        <div>
          <i>Translations over time and location</i>
        </div>
        <div>
          This web app can be used to query and investigate recorded
          translations of Euclid's Elements. Use the navigation arrows to
          continue the tour.
        </div>
      </Wrapper>
    ),
  },
  {
    selector: `#${CITY_MARKER_ID}Paris`,
    content: (
      <Wrapper>
        <div>Hover over any city to view its name and record count.</div>
        <div>Click the city to explore relevant translations.</div>
      </Wrapper>
    ),
  },
  {
    selector: `#${FILTER_INDEXED_ID}0`,
    content: (
      <Wrapper>Use the filters to refine the presented translations.</Wrapper>
    ),
  },
  {
    selector: `#${COLLAPSE_FILTER_BUTTON_ID}`,
    content: <Wrapper>Collapse or expand the filters pane.</Wrapper>,
  },
  {
    selector: `#${ZOOM_CONTROLS_ID}`,
    content: (
      <Wrapper>
        <div>Use these controls to zoom/in out of the map.</div>
        <div>The map can be dragged using your mouse or touch gestures.</div>
      </Wrapper>
    ),
  },
  {
    selector: `#${TIMELINE_RANGE_ID}`,
    content: (
      <Wrapper>
        <div>Set years range for the displayed translations.</div>
        <div>
          Translations recorded between the lower bound year and the upper bound
          are included.
        </div>
      </Wrapper>
    ),
  },
  {
    selector: `#${TIMELINE_PLAY_ID}`,
    content: (
      <Wrapper>
        Use the play/pause button to automatically advance within the time
        range.
      </Wrapper>
    ),
  },

  {
    selector: "body",
    content: (
      <Wrapper>
        <Title>Credits and License</Title>
        <div>
          All details can be found at{" "}
          <Link
            url="https://github.com/ReallyLiri/elements-timeline/blob/main/README.md"
            text="elements-timeline Github repository."
          />
        </div>
      </Wrapper>
    ),
  },
];
