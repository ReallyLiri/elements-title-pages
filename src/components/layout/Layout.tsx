import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import styled from "@emotion/styled";

const LayoutContainer = styled.div`
  height: 100vh;
  width: 100vw;
`;

const MainContent = styled.main``;

function Layout() {
  return (
    <LayoutContainer>
      <Navigation />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
}

export default Layout;
