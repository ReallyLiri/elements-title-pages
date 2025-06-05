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
import HighlightedText from "../features/HighlightedText.tsx";
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

type ItemModalProps = {
  item: Item;
  features: Feature[];
  onClose: () => void;
};

const SmallText = styled.span`
  font-size: 0.8rem;
  color: darkgray;
`;

const StyledHelpTip = styled(HelpTip)<{ marginTop?: string }>`
  margin: 0 0 ${({ marginTop }) => marginTop || "0"} -0.5rem;
  z-index: 100;
`;

const StyledAnchor = styled.a`
  font-size: 1rem;
  svg {
    color: ${LAND_COLOR};
    margin-bottom: -2px;
  }
`;

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
        <ModalTitleRow>
          <span>{item.year || "s.d."}</span>
          <span>
            <SmallText>by</SmallText> {item.authors.join(" & ") || "s.n."}
          </span>
          <span>
            <SmallText>in</SmallText> {item.cities.join(", ") || "s.l."}
          </span>
          <span>
            <SmallText>in</SmallText> {item.languages.join(" & ")}
          </span>
          {item.scanUrl && (
            <StyledAnchor
              href={item.scanUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-tooltip-id={TOOLTIP_SCAN}
              data-tooltip-content="View Facsimilie Online"
              data-tooltip-place="bottom"
            >
              <FaBookReader />
            </StyledAnchor>
          )}
        </ModalTitleRow>
        <ModalTitleRow>
          {item.format && (
            <span>
              <SmallText>Format:</SmallText> {item.format}
            </span>
          )}
          {item.volumesCount && (
            <span>
              <SmallText>Volumes:</SmallText> {item.volumesCount}
            </span>
          )}
          {item.elementsBooks && (
            <span>
              <SmallText>Books:</SmallText>{" "}
              {item.elementsBooks
                .map((range) =>
                  range.end === range.start
                    ? range.start.toString()
                    : `${range.start}-${range.end}`,
                )
                .join(", ")}
            </span>
          )}
          {item.class && (
            <>
              <span>
                <SmallText>Wardhaugh Class:</SmallText> {item.class}
              </span>
              <StyledHelpTip tooltipId={TOOLTIP_WCLASS} />
            </>
          )}
          {item.additionalContent && item.additionalContent.length > 0 && (
            <span>
              <SmallText>Additional Content:</SmallText>{" "}
              {item.additionalContent.join(", ")}
            </span>
          )}
        </ModalTitleRow>
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
          {item.title && item.title !== "?" && (
            <TextColumnsContainer>
              <ModalTextColumn isTextContent>
                <ModalTitle justifyStart gap={1}>
                  Original Text
                  <StyledHelpTip
                    tooltipId={TOOLTIP_TRANSCRIPTION}
                    marginTop="2px"
                  />
                </ModalTitle>
                <HighlightedText
                  text={item.title}
                  features={features}
                  mapping={item.features}
                />
                {item.imprint && (
                  <>
                    <hr style={{ opacity: 0.3 }} />
                    <HighlightedText
                      text={item.imprint}
                      features={features}
                      mapping={item.features}
                    />
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
                  <HighlightedText
                    text={item.titleEn || ""}
                    features={[]}
                    mapping={{}}
                  />
                  {item.imprintEn && (
                    <>
                      {item.imprint && <hr style={{ opacity: 0.3 }} />}
                      <HighlightedText
                        text={item.imprintEn}
                        features={[]}
                        mapping={{}}
                      />
                    </>
                  )}
                </ModalTextColumn>
              )}
            </TextColumnsContainer>
          )}
        </ModalTextContainer>
      </ModalContent>
    </Modal>
  );
};

export default ItemModal;
