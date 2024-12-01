import ytdl from 'ytdl-core';

export default async function handler(req, res) {
  const { url, format } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const contentType = format === 'audio' ? 'audio/mpeg' : 'video/mp4';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="download.${format === 'audio' ? 'mp3' : 'mp4'}"`);

    const stream = ytdl(url, { quality: format === 'audio' ? 'highestaudio' : 'highestvideo' });
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process the request' });
  }
}
