import styled from "@emotion/styled";
import { Row } from "./App.tsx";

export type RangeSliderProps = {
  name: string;
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
`;

const MinInput = styled(SliderInput)`
  z-index: 5;
`;

const MaxInput = styled(SliderInput)`
  z-index: 4;
`;

const Value = styled.div`
  margin: 0 0.5rem;
`;

export const RangeSlider = ({
  name,
  value,
  min,
  max,
  onChange,
}: RangeSliderProps) => (
  // todo (liri): please add a manual input field for the range values (it's too hard to be precise with the slider)
  <Row justifyStart noWrap>
    <div>{name}:</div>
    <Value>{value[0]}</Value>
    <SliderContainer>
      <SliderTrack />
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
    <Value>{value[1]}</Value>
  </Row>
);

export default RangeSlider;
