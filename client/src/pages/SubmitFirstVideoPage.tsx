import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BlackSent from "../assets/blackSent.png";
import whiteFileUpload from "../assets/whiteFileUpload.png";
const Url = import.meta.env.VITE_SERVER_URL;

interface SubmitFirstVideoPageProps {
  handleLogout: () => void;
  loggedIn: boolean;
  userId: string;
}

function SubmitFirstVideoPage({
  handleLogout,
  loggedIn,
  userId,
}: SubmitFirstVideoPageProps) {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!loggedIn) {
      navigate("/login");
    }
  }, [loggedIn, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith("video/")) {
        setError("Please select a video file");
        setFileName("");
        setFile(null);
        e.target.value = "";
        return;
      }

      // Validate file size (500MB)
      const maxSize = 500 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError("File size must be less than 500MB");
        setFileName("");
        setFile(null);
        e.target.value = "";
        return;
      }

      setError("");
      setFileName(selectedFile.name);
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      setIsUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", fileName);
      formData.append("userId", userId);

      const response = await fetch(Url + "/videos/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      console.log("Upload successful:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-row justify-center bg-gray-950 relative">
      <button
        className="absolute right-2 top-2 font-semibold text-lg px-6 h-12 rounded-xl flex justify-center items-center hover:opacity-70 duration-200 cursor-pointer border-2 border-white text-white"
        onClick={handleLogout}
      >
        Log out
      </button>
      <div className="w-[500px] h-full flex flex-col justify-center text-center">
        <div>
          <h1 className="text-5xl font-bold leading-snug mb-8 text-white">
            10x the clips.
            <br />
            Half the time.
          </h1>
          <p className="text-xl font-medium mb-8 text-white">
            Repurpose your content into short, viral clips
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500 text-white rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="file"
              id="file-upload"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />

            <label
              htmlFor="file-upload"
              className={`px-6 h-12 w-full rounded-xl flex justify-center items-center duration-200 cursor-pointer border-2 border-white ${
                isUploading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-70"
              }`}
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

            <button
              type="submit"
              className="mt-4 bg-white px-6 h-12 w-full rounded-xl flex justify-center items-center duration-200 hover:opacity-80"
            >
              <p className="font-semibold text-lg mr-2">
                {isUploading ? "Uploading..." : "Get clips"}
              </p>
              <img className="h-6" src={BlackSent} alt="sent icon" />
            </button>
            {isUploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-white mt-2 text-sm">
                  {uploadProgress === 0
                    ? "Starting upload..."
                    : `${uploadProgress}% uploaded`}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default SubmitFirstVideoPage;
