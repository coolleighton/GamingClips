import {
  createBrowserRouter,
  RouterProvider,
  Routes,
  Route,
} from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
const Url = import.meta.env.VITE_SERVER_URL;
import AccountSetupPage from "./pages/AccountSetupPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  // Check if the user is logged in by sending a request to the backend, if logged in get user data
  useEffect(() => {
    const CheckAuth = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(Url + "/users/checkAuth", {
          method: "POST",
          headers: {
            authorization: "Bearer " + token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("user logged in", data);
          setLoggedIn(true);
        } else {
          console.error("Error checking auth");
        }
      } catch (error) {
        console.error("Error checking auth:");
      }
    };

    CheckAuth();
  }, []);

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
