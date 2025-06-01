import { Feature, Item } from "../../types";
import { StyledImage } from "../common.ts";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalMainTitle,
  ModalTextColumn,
  ModalTextContainer,
  ModalTitle,
} from "./ModalComponents";
import HighlightedText from "../features/HighlightedText";
import { imageClicked } from "../../utils/dataUtils";

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
          <ModalTextColumn>
            <ModalTitle>Original Text</ModalTitle>
            <HighlightedText
              text={item.title}
              features={features}
              mapping={item.features}
            />
          </ModalTextColumn>
          {item.titleEn && (
            <ModalTextColumn>
              <ModalTitle>English Translation</ModalTitle>
              <HighlightedText text={item.titleEn} features={[]} mapping={{}} />
            </ModalTextColumn>
          )}
        </ModalTextContainer>
      </ModalContent>
    </Modal>
  );
};

export default ItemModal;
