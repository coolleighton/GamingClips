import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BlackSent from "../assets/blackSent.png";
import whiteFileUpload from "../assets/whiteFileUpload.png";

interface SubmitFirstVideoPageProps {
  handleLogout: () => void;
  loggedIn: boolean;
}

function SubmitFirstVideoPage({
  handleLogout,
  loggedIn,
}: SubmitFirstVideoPageProps) {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  // if logged in is false navigate to log in
  useEffect(() => {
    if (!loggedIn) {
      navigate("/login");
    }
  }, [loggedIn]);

  /*
  // submit video link to YTDL to get video information
  const handleFormSubmit = async () => {
    setDisplayLoading(true);

    try {
      const response = await fetch(ServerUrl + "/conversions/submit_video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(urlData),
      });

      if (response.ok) {
        // save data to state and redirect to confirmVideo Page
        const data = await response.json();

      } else {
        // display error page
        console.error("Failed to send url");
        setDisplayLoading(false);
        setDisplayError(true);
      }
    } catch (error) {
      // display error page
      console.error("Error sending url:", error);
      setDisplayLoading(false);
      setDisplayError(true);
    }
  };
  */

  return (
    <div className="h-screen w-screen flex flex-row justify-center bg-gray-950 relative">
      <button
        className="absolute right-2 top-2 font-semibold text-lg px-6 h-12 rounded-xl flex justify-center items-center hover:opacity-70 duration-200 cursor-pointer border-2 border-white text-white "
        onClick={handleLogout}
      >
        Log out
      </button>
      <div className="w-[500px] h-full flex flex-col justify-center text-center">
        <div>
          <h1 className="text-5xl font-bold leading-snug mb-8 text-white">
            10x the clips.<br></br>Half the time.
          </h1>
          <p className="text-xl font-medium mb-8 text-white">
            Repurpose your content into short, viral clips
          </p>
          <form>
            <input
              type="file"
              id="file-upload"
              required
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Styled label acting as button */}
            <label
              htmlFor="file-upload"
              className="px-6 h-12 w-full rounded-xl flex justify-center items-center hover:opacity-70 duration-200 cursor-pointer border-2 border-white"
            >
              <p className="font-semibold text-lg mr-2 text-white">
                {fileName || "Choose File"}
              </p>
              <img
                className="h-6"
                src={whiteFileUpload}
                alt="file upload icon"
              />
            </label>

            <button className="mt-4 bg-white px-6 h-12 w-full rounded-xl flex justify-center items-center hover:opacity-80 duration-200">
              <p className="font-semibold text-lg mr-2">Get clips</p>
              <img className="h-6" src={BlackSent} alt="sent icon" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SubmitFirstVideoPage;
