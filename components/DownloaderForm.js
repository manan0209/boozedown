import { useState } from "react";

export default function DownloaderForm() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("video");
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      alert("Please enter a valid YouTube URL.");
      return;
    }

    setLoading(true);

    try {
      // Generate download URL
      const sanitizedFileName = "Downloaded_by_boozedown"; // Default name if not extracted from metadata
      const downloadUrl = `/api/download?url=${encodeURIComponent(
        url
      )}&format=${format}&filename=${encodeURIComponent(sanitizedFileName)}`;

      // Trigger download
      window.location.href = downloadUrl;
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to process your request. Please ensure the URL is correct and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    const file = e.target.files?.[0];

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("video", file);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract MP3 from the file.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(/\.[^/.]+$/, ".mp3");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error extracting MP3:", error);
      alert("Failed to extract MP3. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-8">
      {loading && (
        <div className="text-center">
          <div className="loader" />
          <p className="text-brown-600 font-semibold mt-2">Processing your request...</p>
        </div>
      )}

      {/* YouTube Downloader Form */}
      <form
        onSubmit={handleDownload}
        className="bg-foamy-white shadow-lg rounded-xl p-8 space-y-6 border border-amber-500"
      >
        <h2 className="text-2xl font-bold text-brown-600">Download Video or Audio</h2>
        <p className="text-sm text-brown-400">
          Enter the YouTube URL and select the format to get started.
        </p>
        <input
          type="text"
          placeholder="Enter YouTube URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-2 border border-brown-400 rounded-lg bg-foamy-white text-brown-600 placeholder-brown-400"
          required
        />
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="w-full px-4 py-2 border border-brown-400 rounded-lg bg-foamy-white text-brown-600"
        >
          <option value="video">Download Video</option>
          <option value="audio">Download Audio</option>
        </select>
        <button
          type="submit"
          className="w-full bg-amber-500 text-foamy-white font-bold px-6 py-2 rounded-lg hover:bg-amber-600 transition"
        >
          Download
        </button>
      </form>

      {/* Extract MP3 from File Form */}
      <form
        onSubmit={handleFileUpload}
        className="bg-foamy-white shadow-lg rounded-xl p-8 space-y-6 border border-amber-500"
      >
        <h2 className="text-2xl font-bold text-brown-600">Extract MP3 from Video</h2>
        <p className="text-sm text-brown-400">
          Upload a video file to convert it into an MP3 audio track.
        </p>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => handleFileUpload(e)}
          className="w-full px-4 py-2 border border-brown-400 rounded-lg bg-foamy-white text-brown-600"
          required
        />
        <button
          type="submit"
          className="w-full bg-amber-500 text-foamy-white font-bold px-6 py-2 rounded-lg hover:bg-amber-600 transition"
        >
          Extract MP3
        </button>
      </form>
    </div>
  );
}
