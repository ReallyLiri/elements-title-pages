import styled from "@emotion/styled";
import { Container, Row, Text } from "../components/common";
import { useNavigate } from "react-router-dom";
import {
  MARKER_4,
  MARKER_5,
  PANE_COLOR,
  SEA_COLOR,
  TRANSPARENT_BLACK,
} from "../utils/colors.ts";
import {
  CATALOGUE_ROUTE,
  MAP_ROUTE,
  TITLE_PAGES_ROUTE,
} from "../components/layout/routes.ts";
import { FaDraftingCompass, FaMapMarked } from "react-icons/fa";
import { GiHolySymbol } from "react-icons/gi";

import { GrCatalog } from "react-icons/gr";
import { ReactNode, useEffect, useState } from "react";
import { NAVBAR_HEIGHT } from "../components/layout/Navigation.tsx";

const ParallaxBackground = styled.div`
  position: fixed;
  top: calc(${NAVBAR_HEIGHT}px + 12rem);
  left: 0;
  width: 100vw;
  height: 100%;
  background-image: url("/scan.png");
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
  z-index: -1;
  transform: translateY(0);
`;

const StyledContainer = styled(Container)`
  padding-top: 2rem;
  z-index: 1;
  padding-bottom: 2rem;
  max-width: 60vw;
  margin: auto;
  @media (max-width: 600px) {
    max-width: 96vw;
  }
`;

const Title = styled.div`
  font-size: 6rem;
  margin: -2rem;
`;

const CardText = styled.div`
  background-color: ${TRANSPARENT_BLACK};
  border-radius: 0.5rem;
  padding: 1rem;
  width: max-content;
`;

const StyledImage = styled.img`
  max-width: 30vw;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 0.5rem;
`;

const Greek = styled(Row)`
  color: ${SEA_COLOR};
  margin-top: 4rem;
  text-align: center;
  width: max-content;
`;

const Card = ({
  title,
  icon,
  color,
  text,
  imageSrc,
  imageOnLeft,
  onClick,
}: {
  title: string;
  icon: ReactNode;
  onClick?: () => void;
  color?: string;
  imageSrc: string;
  imageOnLeft: boolean;
  text: string;
}) => {
  return (
    <Row noWrap>
      {imageOnLeft && <StyledImage src={imageSrc} alt={title} />}
      <Row column>
        <CardText>
          <Text
            color={color}
            size={1.5}
            onClick={onClick}
            clickable={!!onClick}
          >
            {title}
          </Text>
        </CardText>
        <Text size={1.5} color={color} onClick={onClick} clickable={!!onClick}>
          {icon}
        </Text>
        <CardText>
          {text
            .trim()
            .split("\n")
            .map((line, i) => (
              <div key={i}>{line}</div>
            ))}
        </CardText>
      </Row>
      {!imageOnLeft && <StyledImage src={imageSrc} alt={title} />}
    </Row>
  );
};

function Home() {
  const navigate = useNavigate();
  const [bgImageScrollY, setBgImageScrollY] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.src = "/public/scan.png";

    img.onload = () => {
      const imageAspectRatio = img.naturalHeight / img.naturalWidth;
      const topOffset = NAVBAR_HEIGHT + 12 * 16;

      const handleScroll = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        const imageHeight = viewportWidth * imageAspectRatio;
        setImageHeight(imageHeight);

        const effectiveBackgroundHeight = viewportHeight - topOffset;

        const imageScrollRange = imageHeight - effectiveBackgroundHeight;
        const pageScrollRange =
          document.documentElement.scrollHeight - viewportHeight;

        const scrollRatio = scrollTop / pageScrollRange;
        const translateY = scrollRatio * imageScrollRange;

        setBgImageScrollY(translateY);
      };

      handleScroll();

      window.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    };
  }, []);

  return (
    <>
      <ParallaxBackground
        id="parallax-bg"
        style={{
          height: imageHeight,
          transform: `translateY(-${bgImageScrollY}px)`,
        }}
      />
      <StyledContainer>
        <Row column gap={1}>
          <Title className="gothic">Euclid's Elements</Title>
          <Text size={3} color={MARKER_5}>
            A COMPENDIUM
          </Text>
          <Text size={1.5} color={MARKER_4}>
            by Mia Joskowicz
          </Text>
        </Row>
        <Card
          title="Ov the Evclid"
          icon={<FaDraftingCompass />}
          color={PANE_COLOR}
          imageSrc="/public/frontpiece.png"
          imageOnLeft={true}
          text={`
       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
          facilisis et mauris nec tincidunt. Orci varius natoque penatibus et
          magnis dis parturient montes, nascetur ridiculus mus. Donec mollis,
          sapien quis elementum condimentum, magna urna vulputate erat, sit amet
          accumsan magna urna non magna. Nulla pharetra magna odio, auctor
          bibendum nunc lacinia viverra. Donec ut ultrices enim. Ut mi sem,
          luctus et metus ut, consequat sollicitudin arcu. Morbi feugiat
          vestibulum quam, sit amet vehicula odio placerat at. Cras vel nunc
          ligula. Praesent ex augue, dapibus at faucibus a, feugiat a sapien.
          Donec et dolor urna. Ut luctus placerat finibus.
        `}
        />
        <Card
          title="Editions Catalogue"
          onClick={() => navigate(CATALOGUE_ROUTE)}
          icon={<GrCatalog />}
          color={MARKER_5}
          imageSrc="https://i.imgur.com/MO2gGL6.jpeg"
          imageOnLeft={false}
          text={`
       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
          facilisis et mauris nec tincidunt. Orci varius natoque penatibus et
          magnis dis parturient montes, nascetur ridiculus mus. Donec mollis,
          sapien quis elementum condimentum, magna urna vulputate erat, sit amet
          accumsan magna urna non magna. Nulla pharetra magna odio, auctor
          bibendum nunc lacinia viverra. Donec ut ultrices enim. Ut mi sem,
          luctus et metus ut, consequat sollicitudin arcu. Morbi feugiat
          vestibulum quam, sit amet vehicula odio placerat at. Cras vel nunc
          ligula. Praesent ex augue, dapibus at faucibus a, feugiat a sapien.
          Donec et dolor urna. Ut luctus placerat finibus.
        `}
        />
        <Card
          title="Title Pages Research"
          onClick={() => navigate(TITLE_PAGES_ROUTE)}
          icon={<GiHolySymbol />}
          color={PANE_COLOR}
          imageSrc="https://i.imgur.com/MO2gGL6.jpeg"
          imageOnLeft={true}
          text={`
       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
          facilisis et mauris nec tincidunt. Orci varius natoque penatibus et
          magnis dis parturient montes, nascetur ridiculus mus. Donec mollis,
          sapien quis elementum condimentum, magna urna vulputate erat, sit amet
          accumsan magna urna non magna. Nulla pharetra magna odio, auctor
          bibendum nunc lacinia viverra. Donec ut ultrices enim. Ut mi sem,
          luctus et metus ut, consequat sollicitudin arcu. Morbi feugiat
          vestibulum quam, sit amet vehicula odio placerat at. Cras vel nunc
          ligula. Praesent ex augue, dapibus at faucibus a, feugiat a sapien.
          Donec et dolor urna. Ut luctus placerat finibus.
        `}
        />
        <Card
          title="Timeline and Map"
          onClick={() => navigate(MAP_ROUTE)}
          icon={<FaMapMarked />}
          color={MARKER_5}
          imageSrc="/public/map.png"
          imageOnLeft={false}
          text={`
       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
          facilisis et mauris nec tincidunt. Orci varius natoque penatibus et
          magnis dis parturient montes, nascetur ridiculus mus. Donec mollis,
          sapien quis elementum condimentum, magna urna vulputate erat, sit amet
          accumsan magna urna non magna. Nulla pharetra magna odio, auctor
          bibendum nunc lacinia viverra. Donec ut ultrices enim. Ut mi sem,
          luctus et metus ut, consequat sollicitudin arcu. Morbi feugiat
          vestibulum quam, sit amet vehicula odio placerat at. Cras vel nunc
          ligula. Praesent ex augue, dapibus at faucibus a, feugiat a sapien.
          Donec et dolor urna. Ut luctus placerat finibus.
        `}
        />
        <Greek column gap={0.5}>
          Ἐπίγραμμα παλαιόν. Σχήματα πέντε Πλάτωνος, ὁ Πυθαγόρας σοφὸς εὗρε.
          Πυθαγόρας σοφὸς εὗρε, Πλάτων δ’ ἀρίδηλ’ ἐδίδαξεν, Εὐκλείδης ἐπὶ τοῖσι
          κλέος σοφιηκαλλὲς ἔτευξεν.
        </Greek>
      </StyledContainer>
    </>
  );
}

export default Home;
