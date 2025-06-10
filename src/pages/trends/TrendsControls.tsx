import { Row, Text } from "../../components/common";
import { GroupByOption } from "./useTrendsData";
import { Select } from "./TrendsStyles";

type TrendsControlsProps = {
  groupByOptions: GroupByOption[];
  groupBy: GroupByOption;
  handleGroupByChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  windowSize: number;
  setWindowSize: (size: number) => void;
};

export function TrendsControls({
  groupByOptions,
  groupBy,
  handleGroupByChange,
  windowSize,
  setWindowSize,
}: TrendsControlsProps) {
  return (
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
  );
}