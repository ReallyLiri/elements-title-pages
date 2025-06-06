import styled from "@emotion/styled";
import { Container, Row, Text } from "../components/common";
import { useNavigate } from "react-router-dom";
import { MARKER_4, MARKER_5, PANE_COLOR, SEA_COLOR } from "../utils/colors.ts";
import {
  CATALOGUE_ROUTE,
  TITLE_PAGES_ROUTE,
} from "../components/layout/routes.ts";
import { FaDraftingCompass } from "react-icons/fa";
import { GiHolySymbol } from "react-icons/gi";
import { ReactNode, useEffect, useState } from "react";
import { NAVBAR_HEIGHT } from "../components/layout/Navigation.tsx";
import { css } from "@emotion/react";
import { EIP_URL, MACTUTOR_URL } from "../constants";
import { TbMathMaxMin } from "react-icons/tb";

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
  max-width: 70vw;
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
  padding: 0.5rem;
  width: auto;
`;

const CardText = styled.div`
  ${TextStyle};
`;

const StyledImage = styled.img`
  max-width: 40vw;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 0.5rem;
`;

const Credits = styled(Row)`
  color: ${SEA_COLOR};
  ${TextStyle};
  margin-top: 4rem;
  text-align: center;

  a {
    color: ${SEA_COLOR};
  }
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
  title?: string;
  icon?: ReactNode;
  onClick?: () => void;
  color?: string;
  imageSrc: string;
  imageOnLeft: boolean;
  text: string | ReactNode;
}) => {
  return (
    <Row noWrap>
      {imageOnLeft && <StyledImage src={imageSrc} alt={title} />}
      <Row column gap={0.5}>
        {title && (
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
        )}
        {icon && (
          <Text
            size={1.5}
            color={color}
            onClick={onClick}
            clickable={!!onClick}
          >
            {icon}
          </Text>
        )}
        <CardText>
          {typeof text === "string"
            ? text
                .trim()
                .split("\n")
                .map((line, i) => <div key={i}>{line}</div>)
            : text}
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
This web application is a living resource book that accompanies my PhD research in the area of early modern transmission of Euclid’s Elements.
This project is rooted in two realizations I had early in my PhD journey.
First, a defining feature of a PhD is that there is no source book or textbook to rely on; if there were, it would hardly count as a PhD.
Second, reading mathematical works taught me that one of the best ways to understand something is to explain and demonstrate it.
As an engineer, coding is a primary way for me to express myself, so I began building this site as my evolving handbook. It’s a playground, not a finished product, and it keeps changing alongside the research itself.
        `}
        />
        <Card
          imageSrc="/map.png"
          imageOnLeft={false}
          text={
            <>
              <div>
                The Catalog, Editions Gallery, and Map tabs offer three
                different ways to explore the editions of Euclidean and related
                texts.
              </div>
              <div>
                The Catalog lists editions in a table, each with key details and
                a link to a digital facsimile when available.
              </div>
              <div>
                The Gallery presents the same information with thumbnails and an
                option to expand and view the full details on each edition.
              </div>
              <div>
                The Map places the editions geographically along a timeline.
              </div>
              <div>
                All three tabs share a filtering function that preserves the
                search parameters as you navigate between them.
              </div>
              <div>
                The corpus is based primarily on the{" "}
                <a href={EIP_URL} target="_blank" rel="noopener noreferrer">
                  Wardhaugh et al. catalog
                </a>
                , supplemented by bibliographies from scholarly articles and
                searches in the USTC, BnF collection, and Google Books.
              </div>
              <div>
                The distinction between edition, reimpression, version and the
                classification of a book as a translation of Elements or “other”
                is not always clear and can be challenged.
              </div>
            </>
          }
        />
        <Card
          title="Title Pages Experiment"
          onClick={() => navigate(CATALOGUE_ROUTE)}
          icon={<GiHolySymbol />}
          color={MARKER_5}
          imageSrc="https://i.imgur.com/rumIeIz.jpeg"
          imageOnLeft={false}
          text={`
The Gallery tab includes a toggle that lets you view an experiment in analyzing the title pages of the editions.
This experiment is based on the idea that title pages serve multiple roles.
They designate the book’s identity and can be viewed as an instrument of intellectual and commercial positioning, they can reflect contemporary aesthetic and typographical conventions and they advertise the book’s contents to its intended audience and encode broader intellectual and disciplinary priorities.
In the case of mathematical works such as Elements, title pages can reveal the pedagogical and epistemological frameworks and networks within which mathematics was studied, taught, and disseminated. Thus, they can offer insight into both the circulation of Elements and the social, intellectual, and commercial forces shaping its transmission.
        `}
        />
        <Card
          onClick={() => navigate(TITLE_PAGES_ROUTE)}
          imageSrc="/modal.png"
          imageOnLeft={true}
          text={`
The experiment involved segmenting each text into distinct elements to identify patterns and variations.
The transcription and segmentation of the title pages were done partly by an LLM and partly by automated processes. As a result, the data may contain some unusual errors but also fewer human mistakes and inconsistencies.
The hands-on work with multiple models was part of the experience I aimed to gain from this exploration.
        `}
        />
        <Card
          title="MacTutor Index"
          onClick={() => navigate(MACTUTOR_URL)}
          icon={<TbMathMaxMin />}
          color={MARKER_4}
          imageSrc="/mactutor.png"
          imageOnLeft={false}
          text={
            <>
              <div>
                Another LLM experiment is the MacTutor Index Graph. This project
                grew out of my attempts to make sense of the many mathematicians
                and practitioners active during the period, leading me to rely
                on{" "}
                <a
                  href="https://mathshistory.st-andrews.ac.uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  MacTutor Index
                </a>
                , an online resource which contains biographies of over 3,000
                mathematicians.
              </div>
              <div>
                Using an LLM to process that website, I extracted key
                information from each biography and mapped the connections
                between individuals, displaying everything as a graph.
              </div>
              <div>
                This project is still in its early stages and the LLM output has
                not yet been fully verified and refined.
              </div>
            </>
          }
        />

        <Credits column gap={0.5}>
          <div>
            A data visualization project by Mia Joskowicz and Liri Sokol, 2025,{" "}
            <a
              href="https://creativecommons.org/licenses/by-nc/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              License
            </a>
          </div>
        </Credits>
      </StyledContainer>
    </>
  );
}

export default Home;
