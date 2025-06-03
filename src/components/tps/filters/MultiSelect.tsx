import Select from "react-select";

type OptionLabelProps = {
  option: string;
  tooltip: string;
};

const OptionLabel = ({ option, tooltip }: OptionLabelProps) => (
  <span data-tooltip-id="features" data-tooltip-content={tooltip}>
    {option}
  </span>
);

type MultiSelectProps = {
  name: string;
  options: string[];
  onChange: (values: string[]) => void;
  defaultValues?: string[];
  colors?: Record<string, string>;
  tooltips?: Record<string, string>;
  labelFn?: (opt: string) => string;
  value?: string[];
};

const MultiSelect = ({
  name,
  options,
  onChange,
  defaultValues,
  colors,
  tooltips,
  labelFn,
  value,
}: MultiSelectProps) => (
  <Select
    isMulti
    name={name}
    value={value?.map((v) => ({
      value: v,
      label: tooltips ? (
        <OptionLabel option={v} tooltip={tooltips[v]} />
      ) : labelFn ? (
        labelFn(v)
      ) : (
        v
      ),
    }))}
    defaultValue={defaultValues?.map((v) => ({
      value: v,
      label: tooltips ? (
        <OptionLabel option={v} tooltip={tooltips[v]} />
      ) : labelFn ? (
        labelFn(v)
      ) : (
        v
      ),
    }))}
    options={options.map((option) => ({
      value: option,
      label: tooltips ? (
        <OptionLabel option={option} tooltip={tooltips[option]} />
      ) : labelFn ? (
        labelFn(option)
      ) : (
        option
      ),
    }))}
    className="basic-multi-select"
    classNamePrefix="select"
    onChange={(selected) => onChange(selected.map((option) => option.value))}
    placeholder={`Select ${name}`}
    styles={
      colors
        ? {
            option: (styles, { data }) => {
              return {
                ...styles,
                backgroundColor: colors[data.value],
              };
            },
            multiValue: (styles, { data }) => {
              return {
                ...styles,
                backgroundColor: colors[data.value],
              };
            },
          }
        : undefined
    }
  />
);

export default MultiSelect;
