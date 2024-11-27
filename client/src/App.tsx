import {
  createBrowserRouter,
  RouterProvider,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { useState, useEffect } from "react";
import { UserData } from "./types/user";
const Url = import.meta.env.VITE_SERVER_URL;
import SubmitFirstVideoPage from "./pages/SubmitFirstVideoPage";
import CropFirstVideoPage from "./pages/CropFirstVideoPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

// Protected route wrapper component
const ProtectedRoute = ({
  children,
  loggedIn,
  hasVideos,
  requiredAuth = true,
  requiredVideo = false,
}: {
  children: React.ReactNode;
  loggedIn: boolean;
  hasVideos?: boolean;
  requiredAuth?: boolean;
  requiredVideo?: boolean;
}) => {
  // If auth is required and user is not logged in, redirect to login
  if (requiredAuth && !loggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but no video is required, proceed
  if (loggedIn && !requiredVideo) {
    return <>{children}</>;
  }

  // If video is required but user has no videos, redirect to submit video
  if (requiredVideo && !hasVideos) {
    return <Navigate to="/submitfirstvideo" replace />;
  }

  // If user is logged in and video status matches requirement, proceed
  return <>{children}</>;
};

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Check if the user is logged in by sending a request to the backend
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

  const handleLogout = () => {
    console.log("clicked");
    localStorage.clear();
    setLoggedIn(false);
  };

  // Check if user has any videos
  const hasVideos = userData?.videos && userData.videos.length > 0;

  return (
    <div>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            loggedIn ? (
              <Navigate
                to={hasVideos ? "/cropfirstvideo" : "/submitfirstvideo"}
                replace
              />
            ) : (
              <LoginPage
                setLoggedIn={setLoggedIn}
                setUserData={setUserData}
                loggedIn={loggedIn}
              />
            )
          }
        />
        <Route
          path="/signup"
          element={
            loggedIn ? (
              <Navigate
                to={hasVideos ? "/cropfirstvideo" : "/submitfirstvideo"}
                replace
              />
            ) : (
              <SignupPage loggedIn={loggedIn} />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/submitfirstvideo"
          element={
            <ProtectedRoute loggedIn={loggedIn} hasVideos={hasVideos}>
              <SubmitFirstVideoPage
                handleLogout={handleLogout}
                loggedIn={loggedIn}
                userId={userData?._id || ""}
                setUserData={setUserData}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cropfirstvideo"
          element={
            <ProtectedRoute
              loggedIn={loggedIn}
              hasVideos={hasVideos}
              requiredVideo={true}
            >
              <CropFirstVideoPage handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Root route */}
        <Route
          path="/"
          element={
            !loggedIn ? (
              <Navigate to="/login" replace />
            ) : hasVideos ? (
              <Navigate to="/cropfirstvideo" replace />
            ) : (
              <Navigate to="/submitfirstvideo" replace />
            )
          }
        />
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
