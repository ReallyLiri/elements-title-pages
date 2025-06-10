import { Container, Text } from "../../components/common";
import { TrendsBarChart } from "./TrendsBarChart";
import { TrendsControls } from "./TrendsControls";
import { TrendsPieChart } from "./TrendsPieChart";
import { useTrendsData } from "./useTrendsData";

export function Trends() {
  const {
    groupBy,
    groupByOptions,
    handleGroupByChange,
    windowSize,
    setWindowSize,
    chartData,
    uniqueGroups,
    pieChartData,
  } = useTrendsData();

  return (
    <Container>
      <Text size={1.5}>Editions Trends Over Time</Text>

      <TrendsControls
        groupByOptions={groupByOptions}
        groupBy={groupBy}
        handleGroupByChange={handleGroupByChange}
        windowSize={windowSize}
        setWindowSize={setWindowSize}
      />

      <TrendsBarChart
        chartData={chartData}
        uniqueGroups={uniqueGroups}
        groupBy={groupBy}
      />

      <TrendsPieChart pieChartData={pieChartData} groupBy={groupBy} />
    </Container>
  );
}

export default Trends;