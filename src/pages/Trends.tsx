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
import { filterFields } from "../constants/filterFields";
import { Container, Row, Text } from "../components/common.ts";
import {
  LAND_COLOR,
  MARKER_3,
  MARKER_4,
  MARKER_5,
  SEA_COLOR,
} from "../utils/colors.ts";

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

  const groupByOptions = useMemo(() => {
    const options: GroupByOption[] = [{ key: "", label: "None" }];

    Object.entries(filterFields).forEach(([key, config]) => {
      if (key !== "year") {
        options.push({
          key: key as keyof Item,
          label: config.displayName || key,
          isArray: config.isArray || false,
        });
      }
    });

    return options;
  }, []);

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
      const data: Record<string, unknown> = {
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
      <Text size={1.5}>Editions Trends Over Time</Text>

      <Row>
        <Text size={1.2}>Group by:</Text>
        <Select id="groupBy" value={groupBy.key} onChange={handleGroupByChange}>
          {groupByOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </Select>

        <Text size={1.2}>Year range:</Text>
        <Select
          id="windowSize"
          value={windowSize}
          onChange={(e) => setWindowSize(Number(e.target.value))}
        >
          {[1, 5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} year{size > 1 ? "s" : ""}
            </option>
          ))}
        </Select>
      </Row>

      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: SEA_COLOR,
                border: `1px solid ${MARKER_3}`,
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#ffffff" }}
              labelStyle={{
                color: MARKER_5,
                fontWeight: "bold",
                marginBottom: "10px",
                borderBottom: `1px solid ${MARKER_4}`,
                paddingBottom: "5px",
              }}
              cursor={{ fill: "rgba(74, 7, 106, 0.6)" }}
            />
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
              <Bar
                dataKey="total"
                fill={LAND_COLOR}
                name="Total Editions"
                activeBar={{ fill: MARKER_3 }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Container>
  );
}

export default Trends;
