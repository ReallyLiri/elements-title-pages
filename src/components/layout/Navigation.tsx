import { Link, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { HOME_ROUTE, MAP_ROUTE, TITLE_PAGES_ROUTE } from "./routes.ts";
import { FilterButton } from "./FilterButton";

export const NAVBAR_HEIGHT = 60;

const NavContainer = styled.nav`
  display: flex;
  width: 100vw;
  padding: 1rem;
  height: calc(${NAVBAR_HEIGHT}px - 2rem);
  background-color: black;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const NavContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
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

const SiteTitle = styled.div`
  color: white;
  white-space: nowrap;
`;

function Navigation() {
  const location = useLocation();

  return (
    <NavContainer>
      <NavContent>
        <FilterButton />
        <VerticalLine />
        <SiteTitle>M. Joskowicz Elements Compendium</SiteTitle>
        <VerticalLine />
        <NavItems>
          <NavItem active={location.pathname === HOME_ROUTE}>
            <Link to={HOME_ROUTE}>Home</Link>
          </NavItem>
          <NavItem active={location.pathname === TITLE_PAGES_ROUTE}>
            <Link to={TITLE_PAGES_ROUTE}>Editions</Link>
          </NavItem>
          <NavItem active={location.pathname === MAP_ROUTE}>
            <Link to={MAP_ROUTE}>Timeline</Link>
          </NavItem>
        </NavItems>
      </NavContent>
    </NavContainer>
  );
}

export default Navigation;
