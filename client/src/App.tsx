import {
  createBrowserRouter,
  RouterProvider,
  Routes,
  Route,
} from "react-router-dom";
import "./App.css";
import { useState, useEffect } from "react";
import { UserData } from "./types/user";
const Url = import.meta.env.VITE_SERVER_URL;
import SubmitFirstVideoPage from "./pages/SubmitFirstVideoPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

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

          if (data.user) {
            setUserData(data.user);
            setLoggedIn(true);
          } else {
            console.error("User data missing");
            setLoggedIn(false);
            localStorage.removeItem("token");
          }
        } else {
          console.error("Error checking auth");
          setLoggedIn(false);
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setLoggedIn(false);
        localStorage.removeItem("token");
      }
    };

    CheckAuth();
  }, [loggedIn]);

  // handle logout
  const handleLogout = () => {
    console.log("clicked");
    localStorage.clear();
    setLoggedIn(false);
  };

  return (
    <div>
      <Routes>
        <Route path="/" element={<SignupPage />} />
        <Route
          path="/submitfirstvideo"
          element={
            <SubmitFirstVideoPage
              handleLogout={handleLogout}
              loggedIn={loggedIn}
              userId={userData?._id || ""}
            />
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage setLoggedIn={setLoggedIn} setUserData={setUserData} />
          }
        />
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
