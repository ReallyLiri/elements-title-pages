import styled from "@emotion/styled";
import { Container, Row, Text } from "../components/common";
import { useNavigate } from "react-router-dom";
import { NAVBAR_HEIGHT } from "../components/layout/Navigation.tsx";
import {
  LAND_COLOR,
  MARKER_4,
  MARKER_5,
  PANE_COLOR,
  SEA_COLOR,
} from "../utils/colors.ts";
import { MAP_ROUTE, TITLE_PAGES_ROUTE } from "../components/layout/routes.ts";

const StyledContainer = styled(Container)`
  margin: 0;
  padding-top: 2rem;
  height: calc(100vh - ${NAVBAR_HEIGHT}px - 2rem);
  position: relative;
  z-index: 1;
`;

const Title = styled.div`
  font-size: 6rem;
  margin: -2rem;
`;

const StyledImage = styled.img`
  max-width: 30vw;
  max-height: 30vh;
  object-fit: contain;
  border-radius: 8px;
`;

const Greek = styled(Row)`
  width: fit-content;
  color: ${SEA_COLOR};
  background-color: rgba(0, 0, 0, 0.6);
  padding: 0.5rem;
  border-radius: 0.5rem;
`;

function Home() {
  const navigate = useNavigate();

  return (
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
      <Row gap={2} style={{ justifyContent: "center" }}>
        <div
          onClick={() => navigate(TITLE_PAGES_ROUTE)}
          style={{
            display: "flex",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Row column gap={0.5} width="40vw">
            <StyledImage
              src="https://i.imgur.com/MO2gGL6.jpeg"
              alt="Title Pages View"
            />
            <Text color={PANE_COLOR} size={1.5}>
              Title Pages
            </Text>
          </Row>
        </div>
        <div
          onClick={() => navigate(MAP_ROUTE)}
          style={{
            display: "flex",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Row column gap={0.5} width="40vw">
            <StyledImage src="/map.png" alt="Timeline View" />
            <Text size={1.5} color={LAND_COLOR}>
              Timeline
            </Text>
          </Row>
        </div>
      </Row>
      <Greek column gap={0.5}>
        <Text size={1.2}>Ἐπίγραμμα παλαιόν.</Text>
        <Text size={1.2}>Σχήματα πέντε Πλάτωνος, ὁ Πυθαγόρας σοφὸς εὗρε.</Text>
        <Text size={1.2}>
          Πυθαγόρας σοφὸς εὗρε, Πλάτων δ’ ἀρίδηλ’ ἐδίδαξεν,
        </Text>
        <Text size={1.2}>Εὐκλείδης ἐπὶ τοῖσι κλέος σοφιηκαλλὲς ἔτευξεν.</Text>
      </Greek>
    </StyledContainer>
  );
}

export default Home;
