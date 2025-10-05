import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { Container } from "../components/common";
import { useFilter } from "../contexts/FilterContext";
import { Item } from "../types";
import { ItemInfo } from "../components/tps/modal/ItemInfo";
import { NO_AUTHOR, NO_CITY, NO_YEAR } from "../constants";
import { joinArr } from "../utils/util.ts";
import { fetchDiagrams, buildDiagramImageUrl } from "../utils/githubApi";

const DiagramsContainer = styled.div`
  max-width: 80vw;
  margin: 0 auto;
  color: white;
`;

const DocumentTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
`;

const DocumentDescription = styled.p`
  color: #6b7280;
`;

const DiagramsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const DiagramCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;

const DiagramImage = styled.img`
  width: 100%;
  height: 12rem;
  object-fit: cover;
  background-color: #f3f4f6;
`;

const DiagramInfo = styled.div`
  padding: 1rem;
`;

const DiagramTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const DiagramDetails = styled.div`
  font-size: 0.875rem;
  color: #6b7280;

  p {
    margin: 0;
  }
`;

const Modal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 50;
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  max-width: 64rem;
  max-height: 100%;
  overflow: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
`;

const CloseButton = styled.button`
  color: #9ca3af;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  background: none;
  border: none;

  &:hover {
    color: #6b7280;
  }
`;

const ModalImageContainer = styled.div`
  padding: 1rem;
`;

const ModalImage = styled.img`
  max-width: 100%;
  height: auto;
`;

const NoResults = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  color: #6b7280;
  padding: 2rem;
`;

interface ImageInfo {
  pageNumber: string;
  index: string;
  displayName: string;
}

interface ModalState {
  isOpen: boolean;
  imagePath: string;
  title: string;
}

const parseImageName = (filename: string): ImageInfo => {
  const nameWithoutExt = filename.replace(".jpg", "");
  const parts = nameWithoutExt.split("_");

  if (parts.length >= 3) {
    const pageNumber = parts[0];
    const index = parts[parts.length - 1];

    return {
      pageNumber,
      index,
      displayName: `Page ${pageNumber} [#${index}]`,
    };
  }

  return {
    pageNumber: "",
    index: "",
    displayName: filename,
  };
};

const Diagrams = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");
  const { data } = useFilter();
  const [item, setItem] = useState<Item | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    imagePath: "",
    title: "",
  });

  useEffect(() => {
    if (key && data.length > 0) {
      const foundItem = data.find((item) => item.key === key);
      setItem(foundItem || null);
      if (!foundItem) {
        setError("Edition not found");
        setLoading(false);
        return;
      }
    }
  }, [key, data]);

  useEffect(() => {
    const loadDiagrams = async () => {
      if (!key) {
        setError("No key provided");
        setLoading(false);
        return;
      }

      const result = await fetchDiagrams(key);

      if (result.error) {
        setError(result.error);
      } else {
        setImages(result.images);
      }

      setLoading(false);
    };

    loadDiagrams();
  }, [key]);

  const openImageModal = (imagePath: string, title: string) => {
    setModal({
      isOpen: true,
      imagePath,
      title,
    });
  };

  const closeImageModal = () => {
    setModal({
      isOpen: false,
      imagePath: "",
      title: "",
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeImageModal();
      }
    };

    if (modal.isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [modal.isOpen]);

  if (!key || !item) {
    return (
      <Container>
        <DiagramsContainer>
          <DocumentTitle>Document Not Found</DocumentTitle>
          <DocumentDescription>
            The requested document could not be found.
          </DocumentDescription>
        </DiagramsContainer>
      </Container>
    );
  }

  return (
    <>
      <DiagramsContainer>
        <DocumentTitle>
          {item.year || NO_YEAR} {joinArr(item.authors) || NO_AUTHOR},{" "}
          {joinArr(item.cities) || NO_CITY}
        </DocumentTitle>

        {item && <ItemInfo item={item} showDiagramsLink={false} isRow />}

        <DocumentDescription>
          {loading
            ? "Loading diagrams..."
            : error
              ? error
              : images.length === 0
                ? "No diagrams detected"
                : `${images.length} diagram${images.length === 1 ? "" : "s"} detected`}
        </DocumentDescription>

        <DiagramsGrid>
          {!loading && !error && images.length === 0 && (
            <NoResults>No diagrams found for this document.</NoResults>
          )}

          {images.map((imageName) => {
            const imageInfo = parseImageName(imageName);
            const imagePath = buildDiagramImageUrl(key!, imageName);

            return (
              <DiagramCard
                key={imageName}
                onClick={() => openImageModal(imagePath, imageInfo.displayName)}
              >
                <DiagramImage src={imagePath} alt={imageInfo.displayName} />
                <DiagramInfo>
                  <DiagramTitle>{imageInfo.displayName}</DiagramTitle>
                  <DiagramDetails>
                    <p>Page: {imageInfo.pageNumber}</p>
                    <p>Index: {imageInfo.index}</p>
                  </DiagramDetails>
                </DiagramInfo>
              </DiagramCard>
            );
          })}
        </DiagramsGrid>

        <Modal isOpen={modal.isOpen} onClick={closeImageModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{modal.title}</ModalTitle>
              <CloseButton onClick={closeImageModal}>×</CloseButton>
            </ModalHeader>
            <ModalImageContainer>
              <ModalImage src={modal.imagePath} alt={modal.title} />
            </ModalImageContainer>
          </ModalContent>
        </Modal>
      </DiagramsContainer>
    </>
  );
};

export default Diagrams;
