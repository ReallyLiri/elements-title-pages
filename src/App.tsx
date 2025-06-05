import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Route,
  createRoutesFromElements,
} from "react-router-dom";
import Home from "./pages/Home";
import TitlePage from "./pages/TitlePage";
import Layout from "./components/layout/Layout";
import { TourProvider } from "@reactour/tour";
import { tourSteps } from "./components/map/Tour.tsx";
import { PANE_COLOR_ALT } from "./utils/colors.ts";
import Map from "./pages/Map.tsx";
import {
  HOME_ROUTE,
  MAP_ROUTE,
  TITLE_PAGES_ROUTE,
} from "./components/layout/routes.ts";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<Layout />}>
        <Route path={HOME_ROUTE} element={<Home />} />
        <Route path={TITLE_PAGES_ROUTE} element={<TitlePage />} />
        <Route
          path={MAP_ROUTE}
          element={
            <TourProvider
              steps={tourSteps}
              styles={{
                maskArea: (base) => ({ ...base, rx: 8 }),
                popover: (base) => ({
                  ...base,
                  "--reactour-accent": PANE_COLOR_ALT,
                  borderRadius: "0.5rem",
                }),
              }}
            >
              <Map />
            </TourProvider>
          }
        />
        <Route path="*" element={<Navigate replace to={HOME_ROUTE} />} />
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
}

export default App;
