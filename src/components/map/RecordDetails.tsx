import styled from "@emotion/styled";
import { TRANSPARENT_WHITE } from "../../utils/colors";
import Deco from "./svg/deco1.svg?react";
import { isEmpty } from "lodash";
import { Item, Range } from "../../types";

type RecordDetailsProps = {
  data: Item;
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
`;

const Highlight = styled.p`
  font-weight: bolder;
  background-color: ${TRANSPARENT_WHITE};
  width: fit-content;
  padding: 2px 4px;
  border-radius: 2px;
  margin: 0;
`;

const TopDeco = styled(Deco)``;

const BottomDeco = styled(Deco)`
  transform: rotate(180deg);
  margin-top: 1rem;
`;

const formatBooks = (books: Range[]) => {
  return books
    .map((book) => {
      if (book.start === book.end) {
        return book.start.toString();
      }
      return `${book.start}-${book.end}`;
    })
    .join(", ");
};

const Row = ({
  title,
  value,
  disableHover,
}: {
  title: string;
  value: string;
  disableHover?: boolean;
}) => (
  <div>
    <div className="gothic" title={disableHover ? undefined : title}>
      {title}
    </div>
    <Highlight title={value}>{value}</Highlight>
  </div>
);

export const RecordDetails = ({ data }: RecordDetailsProps) => {
  return (
    <Wrapper>
      <TopDeco />
      <Row title="Year" value={data.year} />
      <Row title="Language" value={data.languages.join(", ")} />
      <Row title="Translator" value={data.authors.join(", ")} />
      <Row title="City" value={data.cities.join(", ")} />
      {data.class && <Row title="Wardhaugh Class" value={data.class} />}
      <Row
        title="Elements Books"
        value={formatBooks(data.elementsBooks)}
        disableHover
      />
      {data.format && <Row title="Edition Format" value={data.format} />}
      {data.volumesCount && (
        <Row title="Number of Volumes" value={data.volumesCount.toString()} />
      )}
      {!isEmpty(data.additionalContent) && (
        <Row
          title="Additional Contents"
          value={data.additionalContent.join(", ")}
        />
      )}
      <BottomDeco />
    </Wrapper>
  );
};
