import { useMemo, useState } from "react";
import styled from "@emotion/styled";
import { useFilter } from "../contexts/FilterContext";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Item } from "../types";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
`;

const Label = styled.label`
  font-size: 1.2rem;
  margin-right: 0.5rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 0.5rem;
  min-width: 200px;
`;

const ChartContainer = styled.div`
  height: 600px;
  width: 100%;
`;

type GroupByOption = {
  key: keyof Item | "";
  label: string;
  isArray?: boolean;
};

type TimeWindow = {
  start: number;
  end: number;
  count: number;
  groups: Record<string, number>;
};

function getGroupByOptions(): GroupByOption[] {
  return [
    { key: "", label: "None" },
    { key: "type", label: "Book Classification" },
    { key: "languages", label: "Languages", isArray: true },
    { key: "cities", label: "Cities", isArray: true },
    { key: "authors", label: "Authors", isArray: true },
    { key: "elementsBooksExpanded", label: "Elements Books", isArray: true },
    { key: "format", label: "Edition Format" },
    { key: "volumesCount", label: "Number of Volumes" },
    { key: "additionalContent", label: "Additional Content", isArray: true },
    { key: "class", label: "Wardhaugh Class" },
    { key: "hasTitle", label: "Has Title Page" },
    { key: "colorInTitle", label: "Colors in Title Page" },
    { key: "titlePageDesign", label: "Title Page Design" },
    { key: "titlePageNumberOfTypes", label: "Title Page Number of Types" },
    { key: "titlePageFrameType", label: "Title Page Frame Type" },
    { key: "titlePageEngraving", label: "Title Page Engraving" },
    { key: "hasPrintersDevice", label: "Title Page has Printer's Device" },
    { key: "hasHourGlassShape", label: "Title Page with Hourglass Shape" },
    { key: "fontTypes", label: "Font Types", isArray: true },
  ];
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#ff8042",
  "#a4de6c",
  "#d0ed57",
  "#ffc658",
];

function Trends() {
  const { filteredItems, range } = useFilter();
  const [groupBy, setGroupBy] = useState<GroupByOption>({
    key: "",
    label: "None",
  });
  const [windowSize, setWindowSize] = useState(10);
  const groupByOptions = useMemo(() => getGroupByOptions(), []);

  const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const option = groupByOptions.find((opt) => opt.key === value) || {
      key: "",
      label: "None",
    };
    setGroupBy(option);
  };

  const timeWindows = useMemo(() => {
    if (!filteredItems.length) return [];

    const [minYear, maxYear] = range;
    const windowsCount = Math.ceil((maxYear - minYear) / windowSize);

    // Initialize time windows
    const windows: TimeWindow[] = Array.from(
      { length: windowsCount },
      (_, i) => {
        const start = minYear + i * windowSize;
        const end = Math.min(start + windowSize - 1, maxYear);
        return {
          start,
          end,
          count: 0,
          groups: {},
        };
      },
    );

    // Count items in each window
    filteredItems.forEach((item) => {
      if (!item.year) return;

      const year = parseInt(item.year.split("/")[0]);
      const windowIndex = Math.floor((year - minYear) / windowSize);

      if (windowIndex >= 0 && windowIndex < windows.length) {
        windows[windowIndex].count += 1;

        if (groupBy.key) {
          const value = item[groupBy.key];

          if (groupBy.isArray && Array.isArray(value)) {
            value.forEach((val) => {
              const strVal = String(val);
              windows[windowIndex].groups[strVal] =
                (windows[windowIndex].groups[strVal] || 0) + 1;
            });
          } else if (value !== null && value !== undefined) {
            const strVal = String(value);
            windows[windowIndex].groups[strVal] =
              (windows[windowIndex].groups[strVal] || 0) + 1;
          }
        }
      }
    });

    return windows;
  }, [filteredItems, range, windowSize, groupBy]);

  const chartData = useMemo(() => {
    if (!timeWindows.length) return [];

    return timeWindows.map((window) => {
      const data: Record<string, any> = {
        name: `${window.start}-${window.end}`,
        total: window.count,
      };

      if (groupBy.key) {
        Object.entries(window.groups).forEach(([group, count]) => {
          data[group] = count;
        });
      }

      return data;
    });
  }, [timeWindows, groupBy]);

  const uniqueGroups = useMemo(() => {
    if (!groupBy.key) return [];

    const groups = new Set<string>();
    timeWindows.forEach((window) => {
      Object.keys(window.groups).forEach((group) => groups.add(group));
    });

    return Array.from(groups);
  }, [timeWindows, groupBy]);

  return (
    <Container>
      <Title>Publication Trends Over Time</Title>

      <ControlsContainer>
        <Label htmlFor="groupBy">Group by:</Label>
        <Select id="groupBy" value={groupBy.key} onChange={handleGroupByChange}>
          {groupByOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </Select>

        <Label htmlFor="windowSize">Year range:</Label>
        <Select
          id="windowSize"
          value={windowSize}
          onChange={(e) => setWindowSize(Number(e.target.value))}
        >
          <option value={5}>5 years</option>
          <option value={10}>10 years</option>
          <option value={20}>20 years</option>
          <option value={50}>50 years</option>
        </Select>
      </ControlsContainer>

      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
            <YAxis />
            <Tooltip />
            <Legend />
            {groupBy.key ? (
              uniqueGroups.map((group, index) => (
                <Bar
                  key={group}
                  dataKey={group}
                  stackId="a"
                  fill={COLORS[index % COLORS.length]}
                  name={group}
                />
              ))
            ) : (
              <Bar dataKey="total" fill="#8884d8" name="Total Publications" />
            )}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Container>
  );
}

export default Trends;
