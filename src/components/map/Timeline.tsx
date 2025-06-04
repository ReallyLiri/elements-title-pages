import { useCallback, useEffect, useRef, useState } from "react";
import { MdPause, MdPlayArrow } from "react-icons/md";
import styled from "@emotion/styled";
import { ButtonStyle, RANGE_FILL } from "../../utils/colors";
import { TOOLTIP_TIMELINE_BUTTON } from "./Tooltips";
import { useLocalStorage } from "usehooks-ts";
import { TIMELINE_PLAY_ID } from "./Tour";
import RangeSlider from "../../RangeSlider.tsx";

type TimelineProps = {
  minYear: number;
  maxYear: number;
  rangeChanged: (from: number, to: number) => void;
};

const PlayButton = styled.div`
  ${ButtonStyle};
  svg {
    margin-bottom: 2px;
  }
`;

const StyledRangeSlider = styled(RangeSlider)`
  width: 100%;
  height: 0.5rem;
`;

const RangeWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  height: 100%;
  width: 100%;
  align-items: center;

  #range-slider {
    #range-slider-track {
      background: ${RANGE_FILL};
    }
    input {
      &::-webkit-slider-thumb {
        border: 0.125rem solid ${RANGE_FILL};
      }
    }
  }
`;

const PLAY_STEP_YEARS = 10;
const PLAY_STEP_SEC = 1;

export const Timeline = ({ minYear, maxYear, rangeChanged }: TimelineProps) => {
  const [value, setValue] = useLocalStorage<[number, number]>(
    "timeline",
    [0, 0],
  );
  const [isPlay, setPlay] = useState<boolean>(false);
  const rangeChangedRef = useRef(rangeChanged);

  useEffect(() => {
    setValue(([from, to]) =>
      from > 0 && to > 0
        ? [from, to]
        : [minYear, Math.round((minYear * 3 + maxYear) / 4)],
    );
  }, [maxYear, minYear, setValue]);

  const playStep = useCallback(
    () =>
      setValue(([from, to]) => [from, Math.min(maxYear, to + PLAY_STEP_YEARS)]),
    [maxYear, setValue],
  );

  useEffect(() => {
    if (!isPlay) {
      return;
    }
    const id = setInterval(playStep, PLAY_STEP_SEC * 1000);
    return () => clearTimeout(id);
  }, [isPlay, playStep]);

  useEffect(() => {
    rangeChangedRef.current(value[0], value[1]);
  }, [rangeChangedRef, value]);

  return (
    <>
      <PlayButton
        id={TIMELINE_PLAY_ID}
        onClick={() => setPlay((p) => !p)}
        data-tooltip-id={TOOLTIP_TIMELINE_BUTTON}
        data-tooltip-content={isPlay ? "Pause" : "Play"}
      >
        {isPlay ? <MdPause /> : <MdPlayArrow />}
      </PlayButton>
      <RangeWrapper>
        {value[0] > 0 && value[1] > 0 && (
          <StyledRangeSlider
            min={minYear}
            max={maxYear}
            value={value}
            onChange={(range: [number, number]) => setValue(range)}
          />
        )}
      </RangeWrapper>
    </>
  );
};
