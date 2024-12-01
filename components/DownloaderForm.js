import { useState } from 'react';

export default function DownloaderForm() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('video');
  const [file, setFile] = useState(null);

  const handleDownload = async (e) => {
    e.preventDefault();
    window.location.href = `/api/download?url=${encodeURIComponent(url)}&format=${format}`;
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch('/api/extract', {
      method: 'POST',
      body: formData,
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audio.mp3';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={handleDownload} className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Download YouTube Video</h2>
        <input
          type="text"
          placeholder="Enter YouTube URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="video">Download Video</option>
          <option value="audio">Download Audio</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Download
        </button>
      </form>

      <form onSubmit={handleFileUpload} className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Extract MP3 from File</h2>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border rounded-lg"
          required
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg">
          Extract MP3
        </button>
      </form>
    </div>
  );
}
