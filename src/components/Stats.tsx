import { Row, Text } from "./common.ts";
import { joinArr } from "../utils/util.ts";
import { useFilter } from "../contexts/FilterContext.tsx";
import { ItemTypes } from "../constants";
import { MARKER_4 } from "../utils/colors.ts";
import { isEmpty } from "lodash";
import { useMemo } from "react";
import styled from "@emotion/styled";

const Highlight = styled.span`
  color: ${MARKER_4};
`;

export const Stats = ({ verb }: { verb?: string }) => {
  const { filteredItems, filters } = useFilter();

  const types = isEmpty(filters["type"])
    ? Object.values(ItemTypes)
    : filters["type"]?.map((a) => a.label);

  const { authorsCount, languagesCount, citiesCount } = useMemo(() => {
    const authorsSet = new Set<string>();
    const citiesSet = new Set<string>();
    const languagesSet = new Set<string>();
    filteredItems.forEach((item) => {
      item.authors?.forEach((author) => authorsSet.add(author));
      item.cities?.forEach((city) => citiesSet.add(city));
      item.languages?.forEach((language) => languagesSet.add(language));
    });
    return {
      authorsCount: authorsSet.size,
      citiesCount: citiesSet.size,
      languagesCount: languagesSet.size,
    };
  }, [filteredItems]);

  return (
    <Row>
      <Text size={1}>
        {verb || "Listing"} <Highlight>{filteredItems.length}</Highlight>{" "}
        {types && joinArr(types)} editions, by{" "}
        <Highlight>{authorsCount}</Highlight> authors, in{" "}
        <Highlight>{languagesCount}</Highlight> languages, from{" "}
        <Highlight>{citiesCount}</Highlight> cities.
      </Text>
    </Row>
  );
};
