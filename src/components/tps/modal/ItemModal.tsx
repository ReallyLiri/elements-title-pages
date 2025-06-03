import { Feature, Item } from "../../../types";
import { StyledImage } from "../../common.ts";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalMainTitle,
  ModalTextColumn,
  ModalTextContainer,
  ModalTitle,
  TextColumnsContainer,
} from "./ModalComponents.tsx";
import HighlightedText from "../features/HighlightedText.tsx";
import { imageClicked } from "../../../utils/dataUtils.ts";

type ItemModalProps = {
  item: Item;
  features: Feature[];
  onClose: () => void;
};

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
        <ModalMainTitle>
          <span>{item.year}</span>
          <span>{item.authors.join(" & ") || "s.n."}</span>
          <span>{item.cities.join(", ") || "s.l."}</span>
          <span>{item.languages.join(" & ")}</span>
        </ModalMainTitle>
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
          <TextColumnsContainer>
            <ModalTextColumn isTextContent>
              <ModalTitle>Original Text</ModalTitle>
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
                <ModalTitle>English Translation</ModalTitle>
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
        </ModalTextContainer>
      </ModalContent>
    </Modal>
  );
};

export default ItemModal;
