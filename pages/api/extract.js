import { formidable } from 'formidable';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process'; // Import exec for running shell commands

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing
  },
};

export default async function handler(req, res) {
  const tmpDir = path.join(process.cwd(), 'tmp');

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir); // Create tmp folder if it doesn't exist
  }

  const form = formidable({
    uploadDir: tmpDir,
    keepExtensions: true,
    maxFileSize: 100 * 1024 * 1024, // Optional: limit file size to 100MB
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(500).send('Error uploading file.');
    }

    console.log('Files:', files); // Log files to inspect its structure

    // Check if the video file exists in the request
    const uploadedFile = files.video && Array.isArray(files.video) ? files.video[0].filepath : files.video?.filepath;
    if (!uploadedFile) {
      return res.status(400).send('No video file uploaded.');
    }

    const outputFile = path.join(tmpDir, `${path.parse(uploadedFile).name}.mp3`);

    console.log('Uploaded file path:', uploadedFile);

    try {
      // Ensure uploaded file exists
      if (!fs.existsSync(uploadedFile)) {
        return res.status(400).send('Uploaded file not found.');
      }

      // Create the FFmpeg command
      const ffmpegPath = 'ffmpeg'; // Use the correct path if FFmpeg is not in your PATH
      const command = `"${ffmpegPath}" -i "${uploadedFile}" -q:a 0 -map a "${outputFile}"`;

      // Execute the command
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg error:', error);
          return res.status(500).send('Error converting video to MP3.');
        }

        if (stderr) {
          console.error('FFmpeg stderr:', stderr);
        }

        console.log('Conversion completed. MP3 file at:', outputFile);

        // Set headers to trigger download
        res.setHeader('Content-Disposition', `attachment; filename=${path.basename(outputFile)}`);
        res.setHeader('Content-Type', 'audio/mpeg');

        const stream = fs.createReadStream(outputFile);
        stream.pipe(res);

        // Clean up files after sending the response
        stream.on('close', () => {
          console.log('File sent successfully.');
          fs.unlinkSync(uploadedFile); // Clean up uploaded video
          fs.unlinkSync(outputFile);  // Clean up output MP3
        });
      });
    } catch (conversionError) {
      console.error('Error during conversion:', conversionError);
      return res.status(500).send('Error converting video to MP3.');
    }
  });
}
