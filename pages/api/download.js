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

    const stream = ytdl(url, {
      quality: format === 'audio' ? 'highestaudio' : 'highestvideo',
    });

    stream.pipe(res);

    stream.on('end', () => {
      res.end();
    });

    stream.on('error', (error) => {
      console.error('Download error:', error);
      if (error.statusCode === 410) {
        return res.status(410).json({ error: 'The video is no longer available.' });
      }
      return res.status(500).json({ error: 'Failed to process the request' });
    });
  } catch (error) {
    console.error('General error:', error);
    return res.status(500).json({ error: 'Failed to process the request' });
  }
}
