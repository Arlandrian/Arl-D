const { exec } = require("child_process");
const { promisify } = require('util');
const os = require("os");
const execPromise = promisify(exec);

var ffmpegPath = "ffmpeg";
if ("win32" == os.platform()) {
  ffmpegPath =
    process.env.LOCALAPPDATA +
    "/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-6.0-full_build/bin/ffmpeg.exe";
}

async function ffmpegExec(args) {
  const ffmpegCommand = `${ffmpegPath} ${args}`;
  try {
    console.log(ffmpegCommand)
    const { stdout, stderr } = await execPromise(ffmpegCommand);
    // await execPromise(ffmpegCommand);
  } catch (error) {
    return error
  }
}

module.exports = ffmpegExec
