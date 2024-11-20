import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserData } from "../types/user";
const Url = import.meta.env.VITE_SERVER_URL;

interface LoginPageProps {
  setLoggedIn: (value: boolean) => void;
  setUserData: (value: UserData | null) => void;
}

const LoginPage = ({ setLoggedIn, setUserData }: LoginPageProps) => {
  const navigate = useNavigate();

  // declare states
  const [errorMessage, setLoginErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // on input field change, set 'formData' to value of input field
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(Url + "/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setLoggedIn(true);

        if (!data.user.accountSetup) {
          navigate("/submitfirstvideo");
        } else {
          //navigate to main app
        }

        // Save token to local storage
        const token = data.token;
        localStorage.setItem("token", token);
      } else {
        const data = await response.json();
        console.error("Error logging in");
        console.error(data.error);
        setLoginErrorMessage(data.error);
      }
    } catch (error) {
      console.error("Error logging in:");
    }
  };

  return (
    <div>
      <div className="h-screen w-[100vw] flex items-center justify-center bg-gray-950">
        <div className="mx-4 sm:mx-0">
          <h1 className="text-center font-semibold text-2xl mb-8 text-white">
            Log in to GamingClips
          </h1>
          <form className="sm:w-[25rem]" onSubmit={handleSubmit}>
            <div
              className="pb-4"
              style={{ display: errorMessage ? "block" : "hidden" }}
            >
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>

            <div className="flex-col ">
              <label className="block text-xs pb-2 text-white" htmlFor="email">
                E-mail*
              </label>
              <input
                className="block mb-2 w-full px-1 py-1 bg-gray-950 text-white"
                name="email"
                placeholder="example@123.com"
                type="email"
                onChange={handleChange}
                value={formData.email}
                required
              />
            </div>
            <hr></hr>
            <div className="flex-col ">
              <label
                className="block text-xs pb-2 mt-4 text-white"
                htmlFor="password"
              >
                Password*
              </label>
              <input
                className="block mb-2 w-full px-1 py-1 bg-gray-950 text-white"
                name="password"
                placeholder="Password"
                type="password"
                onChange={handleChange}
                value={formData.password}
                required
              />
            </div>

            <hr className="mb-8"></hr>

            <button className="w-full bg-white font-semibold text-black py-2 rounded bold hover:bg-gray-300 duration-200 ">
              Log in
            </button>
          </form>
          <div className="flex w-full justify-center ">
            <button
              type="button"
              onClick={() => {
                navigate("/signup");
              }}
              className="text-sm text-gray-300 mt-6 hover:text-white"
            >
              Dont have an account? Sign Up
            </button>{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
