import { useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Item } from "../../types";
import { filterFields } from "../../constants/filterFields";
import { useFilter } from "../../contexts/FilterContext";

export type GroupByOption = {
  key: keyof Item | "";
  label: string;
  isArray?: boolean;
};

export type TimeWindow = {
  start: number;
  end: number;
  count: number;
  groups: Record<string, number>;
};

export function useTrendsData() {
  const { filteredItems, range } = useFilter();
  const [groupBy, setGroupBy] = useLocalStorage<GroupByOption>(
    "trends-group-by",
    {
      key: "",
      label: "None",
    }
  );
  const [windowSize, setWindowSize] = useLocalStorage<number>(
    "trends-window-size",
    10
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
      }
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

  return {
    filteredItems,
    range,
    groupBy,
    setGroupBy,
    windowSize,
    setWindowSize,
    groupByOptions,
    handleGroupByChange,
    chartData,
    uniqueGroups,
    pieChartData,
  };
}