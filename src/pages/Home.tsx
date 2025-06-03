import { Container, Row, Text } from "../components/common";
import { Link } from "react-router-dom";

function Home() {
  return (
    <Container style={{ marginTop: "3rem" }}>
      <Row>
        <Text bold size={2}>
          <Text size={3}>Euclid's Elements</Text>
          <Text size={1.5}>Title Pages Explorer</Text>
        </Text>
      </Row>
      <Row>
        <Text size={1.2}>
          A collection of title pages from historical translations of Euclid's Elements
        </Text>
      </Row>
      <Row>
        <Link to="/tps" style={{ 
          padding: "12px 24px",
          backgroundColor: "#0077cc",
          color: "white",
          textDecoration: "none",
          borderRadius: "4px",
          fontWeight: "bold",
          marginTop: "20px"
        }}>
          Explore Title Pages
        </Link>
      </Row>
    </Container>
  );
}

export default Home;