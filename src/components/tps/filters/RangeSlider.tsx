import styled from "@emotion/styled";
import { Row } from "../../common.ts";
import { useEffect, useState } from "react";

export type RangeSliderProps = {
  name?: string;
  value: [number, number];
  min: number;
  max: number;
  onChange: (value: [number, number]) => void;
};

const SliderContainer = styled.div`
  display: flex;
  position: relative;
  width: 20rem;
  height: 1rem;
  align-items: center;
`;

const SliderTrack = styled.div`
  position: absolute;
  width: 100%;
  height: 0.25rem;
  background-color: #666;
  border-radius: 0.125rem;
`;

const SliderRange = styled.div<{
  left: number;
  width: number;
  min: number;
  max: number;
}>`
  position: absolute;
  left: ${({ left, min, max }) => ((left - min) / (max - min)) * 100}%;
  width: ${({ width, min, max }) => (width / (max - min)) * 100}%;
  height: 0.25rem;
  background-color: #ddd;
  border-radius: 0.125rem;
`;

const SliderInput = styled.input`
  position: absolute;
  width: 100%;
  margin: 0;
  background-color: transparent;
  -webkit-appearance: none;
  appearance: none;
  pointer-events: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 1rem;
    width: 1rem;
    border-radius: 50%;
    background: #ddd;
    border: 0.125rem solid #666;
    cursor: pointer;
    pointer-events: auto;
  }

  &::-webkit-slider-thumb:active {
    transform: scale(1.5);
  }
`;

const MinInput = styled(SliderInput)``;

const MaxInput = styled(SliderInput)``;

const ValueInput = styled.input`
  margin: 0 0.5rem;
  width: 4rem;
  height: 2rem;
  text-align: center;
  border: 1px solid #666;
  border-radius: 4px;
  padding: 2px 4px;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

export const RangeSlider = ({
  name,
  value,
  min,
  max,
  onChange,
}: RangeSliderProps) => {
  const [minInputValue, setMinInputValue] = useState(value[0].toString());
  const [maxInputValue, setMaxInputValue] = useState(value[1].toString());

  useEffect(() => {
    setMinInputValue(value[0].toString());
    setMaxInputValue(value[1].toString());
  }, [value]);

  return (
    <Row justifyStart noWrap id="range-slider">
      {name && <div>{name}:</div>}
      <ValueInput
        type="number"
        min={min}
        max={value[1]}
        value={minInputValue}
        onChange={(e) => setMinInputValue(e.target.value)}
        onBlur={() => {
          const newMin = parseInt(minInputValue);
          if (!isNaN(newMin)) {
            const clampedMin = Math.max(min, Math.min(newMin, value[1]));
            onChange([clampedMin, value[1]]);
          } else {
            setMinInputValue(value[0].toString());
          }
        }}
      />
      <SliderContainer>
        <SliderTrack id="range-slider-track" />
        <SliderRange
          left={value[0]}
          width={value[1] - value[0]}
          min={min}
          max={max}
        />
        <MinInput
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={(e) => {
            const newMin = parseInt(e.target.value);
            if (newMin <= value[1]) {
              onChange([newMin, value[1]]);
            }
          }}
        />
        <MaxInput
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={(e) => {
            const newMax = parseInt(e.target.value);
            if (newMax >= value[0]) {
              onChange([value[0], newMax]);
            }
          }}
        />
      </SliderContainer>
      <ValueInput
        type="number"
        min={value[0]}
        max={max}
        value={maxInputValue}
        onChange={(e) => setMaxInputValue(e.target.value)}
        onBlur={() => {
          const newMax = parseInt(maxInputValue);
          if (!isNaN(newMax)) {
            const clampedMax = Math.min(max, Math.max(newMax, value[0]));
            onChange([value[0], clampedMax]);
          } else {
            setMaxInputValue(value[1].toString());
          }
        }}
      />
    </Row>
  );
};

export default RangeSlider;
