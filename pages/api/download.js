import { exec } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const downloadsDir = path.join(os.homedir(), "Downloads");

  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
  }

  const urlParam = req.url?.split("?")[1]?.split("=")[1];
  const format = req.url?.includes("format=audio") ? "audio" : "video";

  if (!urlParam) {
    return res.status(400).send("URL parameter is required.");
  }

  const decodedUrl = decodeURIComponent(urlParam);
  const outputName = `${Date.now()}`;
  const outputFile = path.join(downloadsDir, `${outputName}`);

  const ytDlpPath = path.join(
    "C:",
    "Users",
    "91805",
    "AppData",
    "Roaming",
    "Python",
    "Python312",
    "Scripts",
    "yt-dlp.exe"
  );

  // Commands for video and audio
  const command =
    format === "audio"
      ? `"${ytDlpPath}" "${decodedUrl}" -f bestaudio -x --audio-format mp3 -o "${outputFile}.%(ext)s"`
      : `"${ytDlpPath}" "${decodedUrl}" -f bestvideo+bestaudio --merge-output-format mp4 -o "${outputFile}.mp4"`;

  console.log("Executing command:", command);

  exec(command, (error, stdout, stderr) => {
    console.log("yt-dlp stdout:", stdout);
    console.log("yt-dlp stderr:", stderr);

    if (error) {
      console.error("Error executing yt-dlp:", error);
      return res.status(500).send("Error downloading the video or audio.");
    }

    const finalFilePath = format === "audio" ? `${outputFile}.mp3` : `${outputFile}.mp4`;

    if (fs.existsSync(finalFilePath)) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${path.basename(finalFilePath)}`
      );
      res.setHeader(
        "Content-Type",
        format === "audio" ? "audio/mpeg" : "video/mp4"
      );

      const stream = fs.createReadStream(finalFilePath);
      stream.pipe(res);

      stream.on("close", () => {
        // Clean up file after sending
        fs.unlinkSync(finalFilePath);
      });
    } else {
      res.status(500).send("Failed to generate the file.");
    }
  });
}
