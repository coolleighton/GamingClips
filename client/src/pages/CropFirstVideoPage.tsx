import { useState, useEffect } from "react";
import React from "react";

interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropFirstVideoPageProps {
  handleLogout: () => void;
  videoUrl?: string; // URL of the uploaded video
}

function CropFirstVideoPage({
  handleLogout,
  videoUrl,
}: CropFirstVideoPageProps) {
  const [videoThumbnail, setVideoThumbnail] = useState<string>("");
  const [isSelecting, setIsSelecting] = useState<"facecam" | "gameplay" | null>(
    "facecam"
  );
  const [facecamRegion, setFacecamRegion] = useState<CropRegion | null>(null);
  const [gameplayRegion, setGameplayRegion] = useState<CropRegion | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );

  // Generate thumbnail from video
  useEffect(() => {
    if (videoUrl) {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.addEventListener("loadeddata", () => {
        video.currentTime = 1; // Get thumbnail from 1 second into video
      });
      video.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0);
        setVideoThumbnail(canvas.toDataURL());
      });
    }
  }, [videoUrl]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPoint({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!startPoint || !isSelecting) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const region = {
      x: Math.min(startPoint.x, currentX),
      y: Math.min(startPoint.y, currentY),
      width: Math.abs(currentX - startPoint.x),
      height: Math.abs(currentY - startPoint.y),
    };

    if (isSelecting === "facecam") {
      setFacecamRegion(region);
    } else {
      setGameplayRegion(region);
    }
  };

  const handleMouseUp = () => {
    setStartPoint(null);
  };

  const handleSave = async () => {
    if (!facecamRegion || !gameplayRegion) {
      alert("Please select both regions before saving");
      return;
    }

    // Here you would send the crop regions to your backend
    try {
      const response = await fetch("/api/save-crop-regions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facecam: facecamRegion,
          gameplay: gameplayRegion,
        }),
      });

      if (response.ok) {
        // Handle successful save
        console.log("Crop regions saved successfully");
      }
    } catch (error) {
      console.error("Error saving crop regions:", error);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-950 flex flex-col items-center">
      <button
        className="absolute right-2 top-2 font-semibold text-lg px-6 h-12 rounded-xl flex justify-center items-center hover:opacity-70 duration-200 cursor-pointer border-2 border-white text-white"
        onClick={handleLogout}
      >
        Log out
      </button>

      <div className="max-w-4xl w-full mt-16 px-4">
        <h1 className="text-3xl font-bold text-white mb-8">
          Select Crop Regions
        </h1>

        <div className="flex gap-4 mb-8">
          <button
            className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold hover:opacity-75 duration-150 ${
              isSelecting === "facecam"
                ? "bg-blue-500 text-white"
                : "bg-white text-black"
            }`}
            onClick={() => setIsSelecting("facecam")}
          >
            Select Facecam Region
          </button>

          <button
            className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold hover:opacity-75 duration-150 ${
              isSelecting === "gameplay"
                ? "bg-green-500 text-white"
                : "bg-white text-black"
            }`}
            onClick={() => setIsSelecting("gameplay")}
          >
            Select Gameplay Region
          </button>
        </div>

        <div
          className="relative w-full bg-black rounded-xl overflow-hidden cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Placeholder or actual video thumbnail */}
          {videoThumbnail ? (
            <img
              src={videoThumbnail}
              alt="Video thumbnail"
              className="w-full"
            />
          ) : (
            <div className="w-full h-96  flex items-center justify-center bg-gray-950 border-2 border-white text-white rounded-2xl">
              <p className="text-gray-400">Loading thumbnail...</p>
            </div>
          )}

          {/* Facecam selection overlay */}
          {facecamRegion && (
            <div
              className="absolute border-4 border-blue-500 bg-blue-500 bg-opacity-20"
              style={{
                left: facecamRegion.x,
                top: facecamRegion.y,
                width: facecamRegion.width,
                height: facecamRegion.height,
              }}
            >
              <div className="absolute -top-6 left-0 bg-blue-500 px-2 py-1 text-xs text-white rounded">
                Facecam
              </div>
            </div>
          )}

          {/* Gameplay selection overlay */}
          {gameplayRegion && (
            <div
              className="absolute border-4 border-green-500 bg-green-500 bg-opacity-20"
              style={{
                left: gameplayRegion.x,
                top: gameplayRegion.y,
                width: gameplayRegion.width,
                height: gameplayRegion.height,
              }}
            >
              <div className="absolute -top-6 left-0 bg-green-500 px-2 py-1 text-xs text-white rounded">
                Gameplay
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <div className="text-gray-400">
            {!facecamRegion && !gameplayRegion && (
              <p>Select regions for both facecam and gameplay</p>
            )}
            {facecamRegion && !gameplayRegion && (
              <p>Now select the gameplay region</p>
            )}
            {!facecamRegion && gameplayRegion && (
              <p>Now select the facecam region</p>
            )}
            {facecamRegion && gameplayRegion && (
              <p>Both regions selected! You can adjust them or save.</p>
            )}
          </div>

          <button
            className={`px-8 py-3 rounded-xl font-semibold ${
              facecamRegion && gameplayRegion
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-700 cursor-not-allowed"
            } text-white transition-colors`}
            onClick={handleSave}
            disabled={!facecamRegion || !gameplayRegion}
          >
            Save Regions
          </button>
        </div>
      </div>
    </div>
  );
}

export default CropFirstVideoPage;
