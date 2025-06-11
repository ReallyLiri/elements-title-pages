import styled from "@emotion/styled";
import { Container, Row, Text } from "../../components/common";
import { TrendsBarChart } from "./TrendsBarChart";
import { TrendsControls } from "./TrendsControls";
import { TrendsPieChart } from "./TrendsPieChart";
import { useTrendsData } from "./useTrendsData";
import { IoWarning } from "react-icons/io5";

const NoteLine = styled(Row)`
  opacity: 0.8;
  margin: -1rem 0;
`;

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

      <NoteLine gap={0.5}>
        <IoWarning /> Features were partially identified using an LLM and may
        not be accurate.
      </NoteLine>

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
