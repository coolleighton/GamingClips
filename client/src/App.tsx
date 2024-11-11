import {
  createBrowserRouter,
  RouterProvider,
  Routes,
  Route,
} from "react-router-dom";
import "./App.css";
import AccountSetupPage from "./pages/AccountSetupPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<AccountSetupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
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
