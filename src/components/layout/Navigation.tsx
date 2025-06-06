import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import {
  CATALOGUE_ROUTE,
  HOME_ROUTE,
  MAP_ROUTE,
  TITLE_PAGES_ROUTE,
} from "./routes.ts";
import { MARKER_5 } from "../../utils/colors.ts";
import { useLayoutEffect } from "react";
import { BsBoundingBoxCircles } from "react-icons/bs";
import { FilterButton } from "./FilterButton";
import { MACTUTOR_URL } from "../../constants";
import { FaExternalLinkAlt } from "react-icons/fa";

export const NAVBAR_HEIGHT = 60;

const Placeholder = styled.div`
  height: ${NAVBAR_HEIGHT}px;
`;

const NavContainer = styled.nav`
  position: fixed;
  display: flex;
  width: 100vw;
  padding: 1rem;
  height: calc(${NAVBAR_HEIGHT}px - 2rem);
  background-color: black;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 1001;
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
  margin: 0 2rem;
`;

const SiteTitle = styled.div`
  color: ${MARKER_5};
  white-space: nowrap;
  cursor: pointer;
`;

const StyledBoxIcon = styled(BsBoundingBoxCircles)`
  margin-left: 0.5rem;
  color: ${MARKER_5};
  cursor: pointer;
`;

const FixedFilterButtonContainer = styled.div`
  position: fixed;
  top: calc(${NAVBAR_HEIGHT}px + 1rem);
  left: 1rem;
  z-index: 90;
`;

const StyledExternalIcon = styled(FaExternalLinkAlt)`
  font-size: 0.8rem;
  margin-left: 0.5rem;
`;

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <NavContainer>
        <NavContent>
          <SiteTitle onClick={() => navigate(HOME_ROUTE)}>
            Euclid's Elements: A Resource Box
          </SiteTitle>
          <StyledBoxIcon onClick={() => navigate(HOME_ROUTE)} />
          <VerticalLine />
          <NavItems>
            <NavItem active={location.pathname === HOME_ROUTE}>
              <Link to={HOME_ROUTE}>Home</Link>
            </NavItem>
            <NavItem active={location.pathname === CATALOGUE_ROUTE}>
              <Link to={CATALOGUE_ROUTE}>Catalogue</Link>
            </NavItem>
            <NavItem active={location.pathname === TITLE_PAGES_ROUTE}>
              <Link to={TITLE_PAGES_ROUTE}>Editions Gallery</Link>
            </NavItem>
            <NavItem active={location.pathname === MAP_ROUTE}>
              <Link to={MAP_ROUTE}>Map</Link>
            </NavItem>
            <div />
            <NavItem active={false}>
              <Link to={MACTUTOR_URL} target="_blank" rel="noreferrer noopener">
                MacTutor Index Graph <StyledExternalIcon />
              </Link>
            </NavItem>
          </NavItems>
        </NavContent>
      </NavContainer>
      <Placeholder />
      {location.pathname !== HOME_ROUTE && (
        <FixedFilterButtonContainer>
          <FilterButton />
        </FixedFilterButtonContainer>
      )}
    </>
  );
}

export default Navigation;
