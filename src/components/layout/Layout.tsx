import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import styled from "@emotion/styled";
import { FilterPane } from "../map/FilterPane";

const LayoutContainer = styled.div`
  height: 100vh;
  width: 100vw;
`;

const MainContent = styled.main``;

function Layout() {
  return (
    <LayoutContainer>
      <Navigation />
      <FilterPane />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
}

export default Layout;
