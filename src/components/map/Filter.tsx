import Select from "react-select";
import {
  LAND_COLOR,
  SEA_COLOR,
  TRANSPARENT_WHITE,
} from "../../utils/colors";
import styled from "@emotion/styled";
import { MdQuestionMark } from "react-icons/md";
import { ReactElement } from "react";
import { Link } from "./Link";
import { Tooltip } from "react-tooltip";
import { Item } from "../../types";

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
  background-color: ${TRANSPARENT_WHITE};
  color: ${SEA_COLOR};
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

const HelpFloatingTip = styled.div`
  height: fit-content;
  width: fit-content;
  padding: 0.5rem;
  a {
    color: #333;
  }
`;

export const HelpTip = ({
  children,
  id,
  className,
}: {
  className?: string;
  id?: string;
  children: ReactElement;
}) => {
  const HELP_TIP_ID = id || "help-tip";
  return (
    <>
      <HelpTipButton id={HELP_TIP_ID} className={className}>
        <StyledQuestionMark />
      </HelpTipButton>
      <Tooltip anchorSelect={`#${HELP_TIP_ID}`} clickable>
        <HelpFloatingTip>{children}</HelpFloatingTip>
      </Tooltip>
    </>
  );
};

const OptionalHelpTip = ({ field }: { field: keyof Item }) => {
  if (field === "class") {
    return (
      <HelpTip>
        <div>
          Classification according to{" "}
          <Link
            url="https://bibsoc.org.uk/euclid-print-1482-1703/"
            text="Euclid in print"
          />
        </div>
      </HelpTip>
    );
  }
  return undefined;
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
        <OptionalHelpTip field={field} />
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