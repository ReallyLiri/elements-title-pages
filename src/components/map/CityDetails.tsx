import { FLOATING_CITY, Translation } from "../data/data";
import { sortBy } from "lodash";
import { useMemo } from "react";
import styled from "@emotion/styled";
import { PANE_COLOR, TRANSPARENT_BLACK } from "../utils/colors";
import { ReactComponent as TopDeco } from "./svg/deco3.svg";
import { ReactComponent as BottomDeco } from "./svg/deco2.svg";

type CityDetailsProps = {
  city: string;
  data: Translation[];
  selectedRecordId: string | undefined;
  setSelectedRecordId: (selected: string) => void;
};

const Title = styled.div`
  background-color: ${TRANSPARENT_BLACK};
  color: ${PANE_COLOR};
  width: calc(100% - 1rem);
  padding: 0.5rem;
  border-radius: 0.5rem;
  text-align: center;
`;

const Separator = styled.div`
  height: 1px;
  width: 100%;
  background-color: black;
  margin-bottom: 1rem;
`;

const Subtitle = styled.div`
  font-size: 0.8rem;
`;

const RowTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 0.5rem;
  cursor: pointer;
  width: fit-content;
  border-radius: 0.5rem;
  padding: 0.5rem;
  &:hover {
    background-color: ${TRANSPARENT_BLACK};
    color: ${PANE_COLOR};
  }
`;

const StyledTopDeco = styled(TopDeco)`
  transform: rotate(180deg);
  fill: rgba(0, 0, 0, 0.6);
  margin-top: -0.8rem;
`;

const StyledBottomDeco = styled(BottomDeco)`
  fill: rgba(0, 0, 0, 0.6);
  height: 400px;
  width: 100%;
`;

export const CityName = (city: string) =>
  city === FLOATING_CITY ? "Uncategorized" : city;

export const CityDetails = ({
  city,
  data,
  setSelectedRecordId,
}: CityDetailsProps) => {
  const sortedData = useMemo(() => sortBy(data, "year"), [data]);
  return (
    <>
      <Title className="gothic">{CityName(city)}</Title>
      <StyledTopDeco height={64} />
      <Subtitle>{data?.length || 0} records</Subtitle>
      {sortedData.map((translation) => (
        <>
          <div key={translation.id}>
            <Separator />
            <RowTitle onClick={() => setSelectedRecordId(translation.id)}>
              <div className="gothic" title="Year">
                {translation.year || translation.rawCity || "Unknown"}
              </div>
              <div title="Translator">
                <span className="gothic">{translation.translator[0]}</span>
                {translation.translator.substring(1)}
              </div>
            </RowTitle>
          </div>
        </>
      ))}
      <div>
        <StyledBottomDeco viewBox="0 0 80 360" />
      </div>
    </>
  );
};
