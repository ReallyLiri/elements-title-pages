import { useState, memo, lazy, Suspense } from "react";
import { ItemProps } from "../../types";
import {
  Column,
  ExpandIcon,
  ImageExpandIcon,
  ImageTile,
  LanguagesInfo,
  NoImageTile,
  StyledImage,
  TextTile,
} from "../common.ts";
import { imageClicked } from "../../utils/dataUtils";
import ItemModal from "../modal/ItemModal";

const HighlightedText = lazy(() => import("./HighlightedText"));

const ItemView = memo(({ item, height, width, mode, features }: ItemProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Column style={{ height, width }}>
      <div>
        {item.year} {item.authors.join(" & ") || "s.n."},{" "}
        {item.cities.join(", ") || "s.l."}
        <LanguagesInfo>{item.languages.join(" & ")}</LanguagesInfo>
      </div>
      {mode === "texts" && (
        <>
          {item.title === "?" ? (
            <NoImageTile>No title page</NoImageTile>
          ) : (
            <>
              <TextTile alignCenter={!!item.imageUrl}>
                <Suspense fallback={<div>{item.title}</div>}>
                  <HighlightedText
                    text={item.title}
                    features={features}
                    mapping={item.features}
                  />
                </Suspense>
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
            <StyledImage
              src={item.imageUrl}
              onClick={() => imageClicked(item)}
            />
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
          <NoImageTile>Not Available</NoImageTile>
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
