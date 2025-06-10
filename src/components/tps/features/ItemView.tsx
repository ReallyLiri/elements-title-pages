import { useState, memo, lazy, Suspense, useRef, useEffect } from "react";
import { ItemProps } from "../../../types";
import {
  Column,
  ExpandIcon,
  ImageExpandIcon,
  ImageTile,
  LanguagesInfo,
  NoImageTile,
  StyledImage,
  TextTile,
} from "../../common.ts";
import { openScan } from "../../../utils/dataUtils.ts";
import ItemModal from "../modal/ItemModal.tsx";
import { NO_AUTHOR, NO_CITY, NO_YEAR } from "../../../constants";
import { joinArr } from "../../../utils/util.ts";

const HighlightedText = lazy(() => import("./HighlightedText.tsx"));

const ItemView = memo(({ item, height, width, mode, features }: ItemProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Column id={item.key} style={{ height, width }} ref={itemRef}>
      <div>
        {item.year || NO_YEAR} {joinArr(item.authors) || NO_AUTHOR},{" "}
        {joinArr(item.cities) || NO_CITY}
        <LanguagesInfo>{joinArr(item.languages)}</LanguagesInfo>
      </div>
      {mode === "texts" && (
        <>
          {item.title === "?" ? (
            <>
              <NoImageTile>
                No title page
                <ExpandIcon title="Expand" onClick={() => setModalOpen(true)}>
                  ⤢
                </ExpandIcon>
              </NoImageTile>
            </>
          ) : (
            <>
              <TextTile alignCenter={!!item.imageUrl}>
                {!isVisible ? (
                  <div>
                    {item.title}
                    {item.imprint && (
                      <>
                        <hr style={{ opacity: 0.3 }} />
                        {item.imprint}
                      </>
                    )}
                  </div>
                ) : (
                  <Suspense
                    fallback={
                      <div>
                        {item.title}
                        {item.imprint && (
                          <>
                            <hr style={{ opacity: 0.3 }} />
                            {item.imprint}
                          </>
                        )}
                      </div>
                    }
                  >
                    <HighlightedText
                      text={item.title}
                      features={features || []}
                      mapping={item.features}
                    />
                    {item.imprint && (
                      <>
                        <hr style={{ opacity: 0.3 }} />
                        <HighlightedText
                          text={item.imprint}
                          features={features || []}
                          mapping={item.features}
                        />
                      </>
                    )}
                  </Suspense>
                )}
                <ExpandIcon title="Expand" onClick={() => setModalOpen(true)}>
                  ⤢
                </ExpandIcon>
              </TextTile>
            </>
          )}
        </>
      )}
      {mode === "images" &&
        (item.imageUrl ? (
          <ImageTile>
            <StyledImage src={item.imageUrl} onClick={() => openScan(item)} />
            <ImageExpandIcon
              title="Expand"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
            >
              ⤢
            </ImageExpandIcon>
          </ImageTile>
        ) : (
          <NoImageTile>
            Not Available
            <ExpandIcon title="Expand" onClick={() => setModalOpen(true)}>
              ⤢
            </ExpandIcon>
          </NoImageTile>
        ))}

      {modalOpen && (
        <ItemModal
          item={item}
          features={features}
          onClose={() => setModalOpen(false)}
        />
      )}
    </Column>
  );
});

export default ItemView;
