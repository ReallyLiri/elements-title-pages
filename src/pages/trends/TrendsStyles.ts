import styled from "@emotion/styled";

export const Select = styled.select`
  padding: 0.5rem;
  border-radius: 0.5rem;
  min-width: 12rem;
`;

export const ChartContainer = styled.div`
  height: 42rem;
  max-height: 80vh;
  width: 100%;
  .recharts-legend-wrapper {
    padding-top: 1rem;
  }
`;

export const PieChartContainer = styled.div`
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