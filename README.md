# BoozeDown

BoozeDown is a YouTube downloader API built with Next.js. It allows users to download YouTube videos or audio in their preferred format. The project leverages the globally installed `yt-dlp` tool for efficient processing of video/audio downloads.  

## Features

- **Download YouTube Videos**: Download video files in high-quality MP4 format.
- **Download YouTube Audio**: Extract audio and save it in MP3 format.
- **Streamlined API**: Simple endpoints for initiating downloads.
- **Automatic Cleanup**: Ensures temporary files are deleted after downloads.

---

## Why Use `yt-dlp` Globally?

We opted for a global installation of `yt-dlp` for several reasons:

1. **Performance**: Installing `yt-dlp` globally ensures it's pre-compiled and ready to use, reducing overhead during runtime.
2. **Versatility**: `yt-dlp` is a powerful, community-maintained tool that supports various video platforms beyond YouTube, ensuring future scalability.
3. **Separation of Concerns**: By using it globally, the project avoids managing `yt-dlp` binaries directly, simplifying the codebase.
4. **Portability**: Users can easily reuse the global `yt-dlp` installation across other projects.

---

## Installation

Follow these steps to set up the project:

### Prerequisites

- **Node.js**: Ensure you have Node.js installed on your system.
- **Global Installation of `yt-dlp`**:  
  You need to install `yt-dlp` globally on your system.  

#### Installing `yt-dlp`
1. Install Python 3.7 or later if it's not already installed.  
   [Download Python](https://www.python.org/downloads/)

2. Install `yt-dlp` using Python's package manager `pip`:  
   ```bash
   pip install -U yt-dlp
3. Verify the installation:
   ```bash
   yt-dlp --version
   
### Clone the Repository
   ```bash
    git clone https://github.com/your-username/boozedown.git
    cd boozedown
