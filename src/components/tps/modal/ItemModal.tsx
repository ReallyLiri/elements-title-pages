import { Feature, Item } from "../../../types";
import { Row, StyledImage } from "../../common.ts";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalTextColumn,
  ModalTextContainer,
  ModalTitle,
  ModalTitleRow,
  TextColumnsContainer,
} from "./ModalComponents.tsx";
import { lazy, Suspense } from "react";

const HighlightedText = lazy(() => import("../features/HighlightedText.tsx"));
import { imageClicked } from "../../../utils/dataUtils.ts";
import styled from "@emotion/styled";
import { HelpTip } from "../../map/Filter.tsx";
import { FaBookReader } from "react-icons/fa";
import {
  TOOLTIP_EN_TRANSLATION,
  TOOLTIP_SCAN,
  TOOLTIP_TRANSCRIPTION,
  TOOLTIP_WCLASS,
} from "../../map/MapTooltips.tsx";
import { LAND_COLOR } from "../../../utils/colors.ts";
import { joinArr } from "../../../utils/util.ts";
import { NO_AUTHOR, NO_CITY } from "../../../constants";

type ItemModalProps = {
  item: Item;
  features: Feature[] | null;
  onClose: () => void;
};

const InfoTitle = styled.div`
  font-size: 0.8rem;
  color: darkgray;
  width: 3rem;
`;

const StyledHelpTip = styled(HelpTip)<{
  marginLeft?: string;
  marginTop?: string;
}>`
  margin: 0 0 ${({ marginTop }) => marginTop || "0"}
    ${({ marginLeft }) => marginLeft || "-0.5rem"};
  z-index: 100;
`;

const StyledAnchor = styled.a`
  font-size: 1rem;
  svg {
    color: ${LAND_COLOR};
    margin-bottom: -2px;
  }
`;

const NoTitlePage = styled.div`
  flex: 1;
  text-align: center;
  color: darkgray;
`;

const ItemInfo = ({ item, isRow }: { item: Item; isRow?: boolean }) => (
  <ModalTextColumn isRow={isRow}>
    <Row justifyStart>
      <InfoTitle>Year: </InfoTitle>
      {item.year || "s.d."}
    </Row>
    <Row justifyStart>
      <InfoTitle>{item.authors.length > 1 ? "Authors:" : "Author:"}</InfoTitle>{" "}
      {joinArr(item.authors) || NO_AUTHOR}
    </Row>
    <Row justifyStart>
      <InfoTitle>{item.cities.length > 1 ? "Cities:" : "City:"}</InfoTitle>{" "}
      {joinArr(item.cities)}
    </Row>
    <Row justifyStart>
      <InfoTitle>
        {item.languages.length > 1 ? "Languages:" : "Language:"}
      </InfoTitle>{" "}
      {joinArr(item.languages)}
    </Row>
    {item.scanUrl && (
      <Row justifyStart>
        <InfoTitle>Facsimile:</InfoTitle>
        <StyledAnchor
          href={item.scanUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-tooltip-id={TOOLTIP_SCAN}
          data-tooltip-content="View Facsimile Online"
          data-tooltip-place="bottom"
        >
          <FaBookReader />
        </StyledAnchor>
      </Row>
    )}

    {item.format && (
      <Row justifyStart>
        <InfoTitle>Format:</InfoTitle> {item.format}
      </Row>
    )}
    {item.volumesCount && (
      <Row justifyStart>
        <InfoTitle>Volumes:</InfoTitle> {item.volumesCount}
      </Row>
    )}
    {item.elementsBooks && (
      <Row justifyStart>
        <InfoTitle>Books:</InfoTitle>{" "}
        {joinArr(
          item.elementsBooks.map((range) =>
            range.end === range.start
              ? range.start.toString()
              : `${range.start}-${range.end}`,
          ),
        )}
      </Row>
    )}
    {item.class && (
      <>
        <Row justifyStart>
          <InfoTitle>Class:</InfoTitle> {item.class}
        </Row>
      </>
    )}
    {item.additionalContent && item.additionalContent.length > 0 && (
      <Row justifyStart>
        <InfoTitle>Additional Content:</InfoTitle>{" "}
        {joinArr(item.additionalContent)}
      </Row>
    )}
  </ModalTextColumn>
);

const ItemModal = ({ item, features, onClose }: ItemModalProps) => {
  return (
    <Modal onClick={onClose}>
      <ModalContent
        onClick={(e) => e.stopPropagation()}
        hasImage={!!item.imageUrl}
      >
        <ModalClose title="Close" onClick={onClose}>
          ✕
        </ModalClose>
        {features && <ItemInfo isRow item={item} />}
        <ModalTextContainer>
          {item.imageUrl && (
            <ModalTextColumn isImage>
              <StyledImage
                large
                src={item.imageUrl}
                onClick={() => imageClicked(item)}
              />
            </ModalTextColumn>
          )}
          {features && item.title && item.title !== "?" ? (
            <TextColumnsContainer>
              <ModalTextColumn isTextContent>
                <ModalTitle justifyStart gap={1}>
                  Original Text
                  <StyledHelpTip
                    tooltipId={TOOLTIP_TRANSCRIPTION}
                    marginTop="2px"
                  />
                </ModalTitle>
                <Suspense fallback={<div>{item.title}</div>}>
                  <HighlightedText
                    text={item.title}
                    features={features}
                    mapping={item.features}
                  />
                </Suspense>
                {item.imprint && (
                  <>
                    <hr style={{ opacity: 0.3 }} />
                    <Suspense fallback={<div>{item.imprint}</div>}>
                      <HighlightedText
                        text={item.imprint}
                        features={features}
                        mapping={item.features}
                      />
                    </Suspense>
                  </>
                )}
              </ModalTextColumn>
              {(item.titleEn || item.imprintEn) && (
                <ModalTextColumn isTextContent>
                  <ModalTitle justifyStart gap={1}>
                    English Translation{" "}
                    <StyledHelpTip
                      tooltipId={TOOLTIP_EN_TRANSLATION}
                      marginTop="2px"
                    />
                  </ModalTitle>
                  <Suspense fallback={<div>{item.titleEn || ""}</div>}>
                    <HighlightedText
                      text={item.titleEn || ""}
                      features={[]}
                      mapping={{}}
                    />
                  </Suspense>
                  {item.imprintEn && (
                    <>
                      {item.imprint && <hr style={{ opacity: 0.3 }} />}
                      <Suspense fallback={<div>{item.imprintEn}</div>}>
                        <HighlightedText
                          text={item.imprintEn}
                          features={[]}
                          mapping={{}}
                        />
                      </Suspense>
                    </>
                  )}
                </ModalTextColumn>
              )}
            </TextColumnsContainer>
          ) : (
            <NoTitlePage>This edition has no title page.</NoTitlePage>
          )}
          {!features && <ItemInfo item={item} />}
        </ModalTextContainer>
      </ModalContent>
    </Modal>
  );
};

export default ItemModal;
