import { Translation } from "../data/data";
import styled from "@emotion/styled";
import { TRANSPARENT_WHITE } from "../data/colors";
import { ReactComponent as Deco } from "../svg/deco1.svg";
import { isEmpty } from "lodash";

type RecordDetailsProps = {
  data: Translation;
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

const formatBooks = (books: number[]) => {
  const result: string[] = [];
  let start = books[0];
  let end = books[0];
  for (let i = 1; i < books.length; i++) {
    if (books[i] === end + 1) {
      end = books[i];
    } else {
      if (start === end) {
        result.push(start.toString());
      } else {
        result.push(`${start}-${end}`);
      }
      start = end = books[i];
    }
  }
  if (start === end) {
    result.push(start.toString());
  } else {
    result.push(`${start}-${end}`);
  }
  return result;
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
      <Row title="Year" value={data.rawYear} />
      <Row title="Language" value={data.language} />
      <Row title="Translator" value={data.translator} />
      <Row title="City" value={data.rawCity} />
      <Row title="Wardhaugh Class" value={data.class} />
      <Row
        title="Elements Books"
        value={formatBooks(data.booksExpanded).join(", ")}
        disableHover
      />
      {data.bookSize && <Row title="Edition Format" value={data.bookSize} />}
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
