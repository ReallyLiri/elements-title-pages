import styled from "@emotion/styled";
import { LAND_COLOR, SEA_COLOR } from "../../utils/colors.ts";

export const Switch = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 0.8rem;
  height: fit-content;
  align-self: end;

  div:first-child {
    border-radius: 5px 0 0 5px;
  }

  div:last-child {
    border-radius: 0 5px 5px 0;
  }
`;

export const SwitchOption = styled.div<{ selected: boolean }>`
  cursor: pointer;
  padding: 4px;
  color: white;
  background-color: ${({ selected }) => (selected ? SEA_COLOR : LAND_COLOR)};
`;
