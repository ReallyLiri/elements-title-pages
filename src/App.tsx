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

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tps" element={<TitlePage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    ),
  );

  return <RouterProvider router={router} />;
}

export default App;