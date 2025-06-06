import styled from "@emotion/styled";
import { Container, Row, Text } from "../components/common";
import { useNavigate } from "react-router-dom";
import { MARKER_5, PANE_COLOR, SEA_COLOR } from "../utils/colors.ts";
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
import { css } from "@emotion/react";

const ParallaxBackground = styled.div`
  position: fixed;
  top: ${NAVBAR_HEIGHT}px;
  left: 0;
  width: 100vw;
  height: 100%;
  background-image: url("/scan-v2.png");
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
  z-index: -1;
  transform: translateY(0);
  will-change: transform;
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

const TextStyle = css`
  background-color: #282828;
  border-radius: 0.5rem;
  padding: 1rem;
  width: auto;
`;

const CardText = styled.div`
  ${TextStyle};
`;

const StyledImage = styled.img`
  max-width: 30vw;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 0.5rem;
`;

const Credits = styled(Row)`
  color: ${SEA_COLOR};
  ${TextStyle};
  margin-top: 4rem;
  text-align: center;
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
  const [imageHeight, setImageHeight] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.src = "/scan-v2.png";
    const bgElement = document.getElementById("parallax-bg");
    if (!bgElement) {
      return;
    }

    img.onload = () => {
      const imageAspectRatio = img.naturalHeight / img.naturalWidth;
      const topOffset = NAVBAR_HEIGHT;

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

        bgElement.style.transform = `translateY(-${translateY}px)`;
      };

      handleScroll();

      window.addEventListener("scroll", handleScroll, { passive: true });
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
        }}
      />
      <StyledContainer>
        <Row column gap={1}>
          <Title className="gothic">Euclid's Elements</Title>
          <Text size={3} color={MARKER_5}>
            A RESOURCE BOX
          </Text>
        </Row>
        <Card
          title="The Project"
          icon={<FaDraftingCompass />}
          color={PANE_COLOR}
          imageSrc="/frontpiece.png"
          imageOnLeft={true}
          text={`
This web application is a living resource book that accompanies my PhD research in the area of early modern transmission of Euclid’s Elements. This project is rooted in two realizations I had early in my PhD journey. First, a defining feature of a PhD is that there is no source book or textbook to rely on; if there were, it would hardly count as a PhD. Second, reading mathematical works taught me that one of the best ways to understand something is to explain and demonstrate it. As an engineer, coding is a primary way for me to express myself, so I began building this site as my evolving handbook. It’s a playground, not a finished product, and it keeps changing alongside the research itself.
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
          imageSrc="/map.png"
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
        <Credits column gap={0.5}>
          A data visualization project by Mia Joskowicz and Liri Sokol, 2025
        </Credits>
      </StyledContainer>
    </>
  );
}

export default Home;
