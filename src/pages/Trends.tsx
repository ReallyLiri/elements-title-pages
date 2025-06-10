import { useMemo } from "react";
import styled from "@emotion/styled";
import { useFilter } from "../contexts/FilterContext";
import { useLocalStorage } from "usehooks-ts";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Item } from "../types";
import { filterFields } from "../constants/filterFields";
import { Container, Row, Text } from "../components/common.ts";
import {
  getStableColor,
  LAND_COLOR,
  MARKER_3,
  MARKER_4,
  MARKER_5,
  SEA_COLOR,
} from "../utils/colors.ts";

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 0.5rem;
  min-width: 12rem;
`;

const ChartContainer = styled.div`
  height: 42rem;
  max-height: 80vh;
  width: 100%;
  .recharts-legend-wrapper {
    padding-top: 1rem;
  }
`;

const PieChartContainer = styled.div`
  margin-top: -2rem;
  height: 24rem;
  max-height: 60vh;
  width: 100%;
  .recharts-legend-wrapper {
    right: 20vw !important;
    max-height: 24rem;
    overflow-y: auto;
  }
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

function Trends() {
  const { filteredItems, range } = useFilter();
  const [groupBy, setGroupBy] = useLocalStorage<GroupByOption>(
    "trends-group-by",
    {
      key: "",
      label: "None",
    },
  );
  const [windowSize, setWindowSize] = useLocalStorage<number>(
    "trends-window-size",
    10,
  );

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
            let strVal = String(value);
            if (strVal === "") {
              strVal = "Uncategorized";
            }
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

  const pieChartData = useMemo(() => {
    if (!groupBy.key || !filteredItems.length) return [];

    const groupCounts: Record<string, number> = {};
    let totalCount = 0;

    filteredItems.forEach((item) => {
      const value = item[groupBy.key as keyof Item];

      if (groupBy.isArray && Array.isArray(value)) {
        value.forEach((val) => {
          const strVal = String(val);
          groupCounts[strVal] = (groupCounts[strVal] || 0) + 1;
          totalCount += 1;
        });
      } else if (value !== null && value !== undefined) {
        let strVal = String(value);
        if (strVal === "") {
          strVal = "Uncategorized";
        }
        groupCounts[strVal] = (groupCounts[strVal] || 0) + 1;
        totalCount += 1;
      }
    });

    return Object.entries(groupCounts)
      .map(([name, value]) => ({
        name,
        value,
        percent: Math.round((value / totalCount) * 100),
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredItems, groupBy]);

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
              itemSorter={() => -1}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const sortedPayload = [...payload].sort((a, b) => (b.value as number) - (a.value as number));
                  
                  return (
                    <div
                      style={{
                        backgroundColor: SEA_COLOR,
                        padding: "10px",
                        border: `1px solid ${MARKER_3}`,
                        borderRadius: "8px",
                      }}
                    >
                      <p
                        style={{
                          color: MARKER_5,
                          fontWeight: "bold",
                          marginBottom: "10px",
                          borderBottom: `1px solid ${MARKER_4}`,
                          paddingBottom: "5px",
                        }}
                      >
                        {label}
                      </p>
                      {sortedPayload.map((entry, index) => {
                        const color =
                          entry.name === "Total Editions"
                            ? LAND_COLOR
                            : getStableColor(entry.name as string);

                        return (
                          <div
                            key={`item-${index}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              color: "#ffffff",
                              margin: "4px 0",
                            }}
                          >
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                backgroundColor: color,
                                marginRight: "8px",
                                borderRadius: "2px",
                              }}
                            />
                            <span style={{ marginRight: "8px" }}>
                              {entry.name}:
                            </span>
                            <span>{entry.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {groupBy.key ? (
              uniqueGroups.map((group) => (
                <Bar
                  key={group}
                  dataKey={group}
                  stackId="a"
                  fill={getStableColor(group)}
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

      {groupBy.key && pieChartData.length > 0 && (
        <>
          <Text size={1.5} style={{ marginTop: "-4rem" }}>
            Distribution of {groupBy.label}
          </Text>
          <PieChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${percent}%`}
                >
                  {pieChartData.map((entry) => (
                    <Cell key={entry.name} fill={getStableColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: SEA_COLOR,
                    border: `1px solid ${MARKER_3}`,
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#ffffff" }}
                  formatter={(value, name) => {
                    const entry = pieChartData.find(
                      (item) => item.name === name,
                    );
                    return [
                      `${name}: ${value} (${entry?.percent}%)`,
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: "10px",
                            height: "10px",
                            backgroundColor: getStableColor(name as string),
                            marginRight: "8px",
                            borderRadius: "2px",
                          }}
                        />
                        {name}
                      </span>,
                    ];
                  }}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  formatter={(value) => {
                    const entry = pieChartData.find(
                      (item) => item.name === value,
                    );
                    return `${value}: ${entry?.value} (${entry?.percent}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </PieChartContainer>
        </>
      )}
    </Container>
  );
}

export default Trends;
