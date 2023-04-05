const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
// const stream = require("stream");
const os = require("os");

// get temp directory
const tempDir = os.tmpdir();

const MAX_VIDEO_MS = 20 * 60 * 1000;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MIN_REQ_MEMORY_BYTES = 200 * 1024 * 1024;

if('win32'==os.platform()){
  ffmpeg.setFfmpegPath(
    process.env.LOCALAPPDATA+"/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-6.0-full_build/bin/ffmpeg.exe"
  );
}

log = (str)=>console.debug("cmd::videoedit: "+str)

// final output will return a file path in the temp folder,
// user of this function has to clean up the 
async function downloadVideoAndAudio(
  videoUrl,
  audioUrl,
  videoStartTime,
  videoEndTime,
  audioStartTime,
  audioEndTime,
  callback
) {
  if (os.freemem() > MIN_REQ_MEMORY_BYTES){
    throw new Error("Not enough memory available on the machine.");
  }

  const timestamp = new Date().getTime();
  const videoOutputPath = `${tempDir}/video_${timestamp}.mp4`;
  const audioOutputPath = `${tempDir}/audio_${timestamp}.mp3`;
  const finalOutputPath = `${tempDir}/final_${timestamp}.mp4`;
  // Validate time ranges
  if (
    videoStartTime < 0 ||
    videoEndTime <= videoStartTime ||
    audioStartTime < 0 ||
    audioEndTime <= audioStartTime
  ) {
    throw new Error("Invalid time range");
  }
  try{
    // Download video without audio
    const videoStream = ytdl(videoUrl, {
      filter: (format) => {
        // Filter out video formats with a height greater than 540 pixels
        return (
          format.hasVideo &&
          !format.hasAudio &&
          format.height <= 540 &&
          format.approxDurationMs != null &&
          format.approxDurationMs < MAX_VIDEO_MS
        );
      },
    });
    let videoSize = 0;
    videoStream.on("data", (chunk) => {
      videoSize += chunk.length;
      if (videoSize > MAX_VIDEO_BYTES) {
        videoStream.destroy();
        throw new Error("Video file too large");
      }
    });
    const videoOutput = fs.createWriteStream(videoOutputPath);
    videoStream.pipe(videoOutput);
    let videoPromise = new Promise((resolve) => {
      videoOutput.on("close", resolve);
    });

    // Download audio only
    const audioStream = ytdl(audioUrl, {
      filter: (format) => {
        // Filter out video formats with a height greater than 540 pixels
        return (
          !format.hasVideo &&
          format.hasAudio &&
          format.approxDurationMs != null &&
          format.approxDurationMs < MAX_VIDEO_MS
        );
      },
    });

    // Error: Only one input stream is supported so we have to write one of the input to file
    // i chose audio
    const audioOutput = fs.createWriteStream(audioOutputPath);
    let audioSize = 0;
    audioStream.on("data", (chunk) => {
      audioSize += chunk.length;
      if (audioSize > MAX_VIDEO_BYTES) {
        audioStream.destroy();
        throw new Error("Audio file too large");
      }
    });
    audioStream.pipe(audioOutput);
    let audioPromise = new Promise((resolve) => {
      audioOutput.on("close", resolve);
    });
    // wait for the audio file download to finish
    await Promise.all([videoPromise, audioPromise])
    log("videos are downloaded")
    // Use fluent-ffmpeg to merge the video and audio files
    await new Promise(resolve=>{
      ffmpeg()
      .addInput(videoOutputPath)
      .seekInput(videoStartTime) // start time in seconds
      .duration(videoEndTime - videoStartTime) // duration in seconds
      .input(audioOutputPath)
      .seekInput(audioStartTime) // start time in seconds
      .duration(audioEndTime - audioStartTime) // duration in seconds
      .addOutputOption("-shortest")
      .output(finalOutputPath)
      .on('end', resolve)
      .run();
    })

    log("final output ready")

    await callback(finalOutputPath)
  }catch(err){
    throw err
  }finally{
    // clean up files
    fs.unlink(videoOutputPath, function(err) {});
    fs.unlink(audioOutputPath, function(err) {});
    fs.unlink(finalOutputPath, function(err) {});
    log("cleaned up files")
  }
}



module.exports = { downloadVideoAndAudio }
// downloadVideoAndAudio(
//   "https://www.youtube.com/watch?v=c1HeRtKk86U",
//   "https://www.youtube.com/watch?v=f0-RYStvdkc",
//   0,
//   25,
//   120,
//   160,
//   (outputPath)=>{
//     console.log(fs.existsSync(outputPath))
//   }
// );

