import { Link, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { Row } from "../common";

const NavContainer = styled.nav`
  display: flex;
  width: 100vw;
  padding: 1rem;
  background-color: black;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  justify-content: center;
`;

const NavItems = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
`;

const NavItem = styled.li<{ active: boolean }>`
  a {
    text-decoration: none;
    color: ${({ active }) => (active ? "#ffffff" : "#aaaaaa")};
    font-weight: ${({ active }) => (active ? "bold" : "normal")};
    font-size: 1.2rem;
    transition: color 0.3s ease;

    &:hover {
      color: white;
    }
  }
`;

const VerticalLine = styled.div`
  width: 1px;
  height: 20px;
  background-color: #aaaaaa;
  margin: 0 1rem;
`;

function Navigation() {
  const location = useLocation();

  return (
    <NavContainer>
      <Row>
        M. Joskowicz Elements Compendium
        <VerticalLine />
        <NavItems>
          <NavItem active={location.pathname === "/"}>
            <Link to="/">Home</Link>
          </NavItem>
          <NavItem active={location.pathname === "/tps"}>
            <Link to="/tps">Title Pages</Link>
          </NavItem>
        </NavItems>
      </Row>
    </NavContainer>
  );
}

export default Navigation;
