import {
  createBrowserRouter,
  RouterProvider,
  Routes,
  Route,
} from "react-router-dom";
import "./App.css";
import AccountSetupPage from "./pages/AccountSetupPage";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<AccountSetupPage />} />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  const router = createBrowserRouter([
    {
      path: "/*",
      element: <App />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default AppWrapper;
