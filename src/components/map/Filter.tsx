import Select from "react-select";
import { LAND_COLOR, SEA_COLOR } from "../../utils/colors";
import styled from "@emotion/styled";
import { MdQuestionMark } from "react-icons/md";
import { Item } from "../../types";
import { TOOLTIP_WCLASS } from "./MapTooltips.tsx";

export type FilterValue = { label: string; value: string };

type FilterProps = {
  id: string;
  field: keyof Item;
  label: string;
  include: boolean;
  setInclude: (include: boolean) => void;
  value: FilterValue[] | undefined;
  setValue: (value: readonly FilterValue[] | undefined) => void;
  options: readonly FilterValue[];
};

const FilterTitle = styled.div`
  font-size: 1.6rem;
  margin-bottom: -0.5rem;
  color: black;
`;

const HelpTipButton = styled.div`
  margin: 0.5rem -0.5rem 0 -0.5rem;
  padding: 0.5rem;
  border-radius: 50%;
  background-color: ${LAND_COLOR};
  color: white;
  cursor: pointer;
  height: 0.5rem;
  width: 0.5rem;
  font-size: 0.8rem;
  svg {
    margin-bottom: 2px;
  }
`;

const StyledQuestionMark = styled(MdQuestionMark)`
  transform: translate(-2px, -2px);
`;

export const HelpTip = ({
  className,
  tooltipId,
}: {
  className?: string;
  tooltipId: string;
}) => {
  return (
    <HelpTipButton className={className} data-tooltip-id={tooltipId}>
      <StyledQuestionMark />
    </HelpTipButton>
  );
};

const Switch = styled.div`
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

const SwitchOption = styled.div<{ selected: boolean }>`
  cursor: pointer;
  padding: 4px;
  color: white;
  background-color: ${({ selected }) => (selected ? SEA_COLOR : LAND_COLOR)};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  margin-bottom: -0.5rem;
  text-wrap: nowrap;
  color: black;
`;

const Filler = styled.div`
  width: 100%;
`;

export const Filter = ({
  id,
  field,
  label,
  value,
  setValue,
  options,
  include,
  setInclude,
}: FilterProps) => {
  return (
    <>
      <Row>
        <FilterTitle className="gothic">{label}</FilterTitle>
        {field === "class" && <HelpTip tooltipId={TOOLTIP_WCLASS} />}
        <Filler />
      </Row>
      <Row>
        <Switch>
          <SwitchOption
            selected={include}
            onClick={() => setInclude(true)}
            title="Include only selected values"
          >
            Include
          </SwitchOption>
          <SwitchOption
            selected={!include}
            onClick={() => setInclude(false)}
            title="Exclude all selected values"
          >
            Exclude
          </SwitchOption>
        </Switch>
      </Row>
      <Select
        id={id}
        value={value}
        options={options}
        isMulti
        onChange={(value) => setValue(value)}
        styles={{
          control: (styles, { isFocused }) => ({
            ...styles,
            boxShadow: isFocused ? `0 0 0 1px ${SEA_COLOR}` : undefined,
            borderColor: isFocused ? SEA_COLOR : undefined,
            ":hover": {
              ...styles[":hover"],
              borderColor: SEA_COLOR,
            },
          }),
          menu: (styles) => ({
            ...styles,
            paddingBottom: "20px",
            backgroundColor: "unset",
            boxShadow: "unset",
          }),
          menuList: (styles) => ({
            ...styles,
            backgroundColor: "white",
            borderRadius: "4px",
            boxShadow:
              "0 0 0 1px hsla(0, 0%, 0%, 0.1), 0 4px 11px hsla(0, 0%, 0%, 0.1)",
          }),
          option: (styles, { isFocused }) => ({
            ...styles,
            backgroundColor: isFocused ? "#f0f0f0" : undefined,
            color: "black",
          }),
          multiValueRemove: (styles) => ({
            ...styles,
            ":hover": {
              backgroundColor: SEA_COLOR,
              color: "white",
            },
          }),
          placeholder: (styles) => ({
            ...styles,
            color: "#666",
          }),
          singleValue: (styles) => ({
            ...styles,
            color: "black",
          }),
          multiValue: (styles) => ({
            ...styles,
            backgroundColor: "#f0f0f0",
          }),
          multiValueLabel: (styles) => ({
            ...styles,
            color: "black",
          }),
        }}
      />
    </>
  );
};
