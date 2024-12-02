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
  try {
    const downloadsDir = path.join(os.homedir(), "Downloads");

    // Ensure Downloads directory exists
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    // Parse URL and format from query parameters
    const queryParams = new URLSearchParams(req.url.split("?")[1]);
    const urlParam = queryParams.get("url");
    const format = queryParams.get("format") === "audio" ? "audio" : "video";

    if (!urlParam) {
      return res.status(400).send("URL parameter is required.");
    }

    const decodedUrl = decodeURIComponent(urlParam);

    // Path to yt-dlp executable
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

    // Command to fetch video title
    const metadataCommand = `"${ytDlpPath}" --get-title "${decodedUrl}"`;

    console.log("Executing metadata command:", metadataCommand);

    exec(metadataCommand, (metadataError, titleStdout, metadataStderr) => {
      if (metadataError) {
        console.error("Error fetching video title:", metadataError);
        return res.status(500).send("Failed to fetch video title.");
      }

      const videoTitle = titleStdout.trim().replace(/[^a-zA-Z0-9_\- ]/g, "_"); // Sanitize title
      const finalTitle = `${videoTitle}-Downloaded by BoozeDown`;
      const outputFile = path.join(
        downloadsDir,
        `${finalTitle || Date.now()}`
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

        // Ensure the file exists before streaming
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

          stream.on("end", () => {
            console.log("File streamed successfully, cleaning up...");
            fs.unlink(finalFilePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error("Error deleting file:", unlinkErr);
              }
            });
          });

          stream.on("error", (streamErr) => {
            console.error("Stream error:", streamErr);
            res.status(500).send("Error streaming the file.");
          });
        } else {
          res.status(500).send("Failed to generate the file.");
        }
      });
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    res.status(500).send("Internal server error.");
  }
}
