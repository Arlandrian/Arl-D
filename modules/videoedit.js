/* eslint-disable linebreak-style */
/* eslint-disable no-useless-catch */
/* eslint-disable space-before-function-paren */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
// const stream = require("stream");
const os = require("os");
const axios = require("axios");

const https = require("https");

// get temp directory
const tempDir = os.tmpdir();

const MAX_VIDEO_MS = 20 * 60 * 1000;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MIN_REQ_MEMORY_BYTES = 128 * 1024 * 1024;

if ("win32" == os.platform()) {
  ffmpeg.setFfmpegPath(
    process.env.LOCALAPPDATA +
      "/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-6.0-full_build/bin/ffmpeg.exe"
  );
}
const debugEnabled = true;
log = (str) => {
  if (debugEnabled) console.debug("cmd::videoedit: " + str);
};

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
  if (os.freemem() < MIN_REQ_MEMORY_BYTES) {
    throw new Error("Not enough memory available on the machine.");
  }

  const timestamp = new Date().getTime();
  const videoOutputPath = `${tempDir}/video_${timestamp}.mp4`;
  const audioOutputPath = `${tempDir}/audio_${timestamp}.mp3`;
  const finalOutputPath = `${tempDir}/final_${timestamp}.mp4`;

  const midProcessVideoOutputPath = `${tempDir}/video_mid_${timestamp}.mp4`;
  const midProcessAudioOutputPath = `${tempDir}/audio_mid_${timestamp}.mp3`;

  // Validate time ranges
  if (
    videoStartTime < 0 ||
    videoEndTime <= videoStartTime ||
    audioStartTime < 0 ||
    audioEndTime <= audioStartTime
  ) {
    throw new Error("Invalid time range");
  }
  try {
    const pRes = await Promise.all([isUrlMP4(videoUrl), isUrlMP4(audioUrl)]);
    const isVideoUrlMp4 = pRes[0];
    const isAudioUrlMp4 = pRes[1];
    log(`1111 ${isVideoUrlMp4} ${isAudioUrlMp4}`);

    let videoStream = null;
    if (isVideoUrlMp4) {
      videoStream = (await axios.get(videoUrl, { responseType: "stream" }))
        .data;
    } else {
      // Download video without audio
      videoStream = ytdl(videoUrl, {
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
    }

    log("2222");
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
    const videoPromise = new Promise((resolve) => {
      videoOutput.on("close", resolve);
    });

    log("3333");

    let audioStream = null;
    if (isAudioUrlMp4) {
      audioStream = (await axios.get(audioUrl, { responseType: "stream" }))
        .data;
    } else {
      // Download audio only
      audioStream = ytdl(audioUrl, {
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
    }

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

    log("5555");

    audioStream.pipe(audioOutput);
    const audioPromise = new Promise((resolve) => {
      audioOutput.on("close", resolve);
    });
    log("6666");

    // wait for the audio file download to finish
    await Promise.all([videoPromise, audioPromise]);
    log("videos are downloaded");

    // middle processing
    // 1. remove audio from the video
    // 2. write it to a temp file
    // 3. delete old file
    // 4. rename new file to old file
    // 5. vice-versa for audio file
    const promises = [];
    if (isVideoUrlMp4) {
      promises.push(removeAudio(videoOutputPath, midProcessVideoOutputPath));
    }

    if (isAudioUrlMp4) {
      promises.push(removeVideo(audioOutput, midProcessAudioOutputPath));
    }

    if (promises.length > 0) {
      log("mid process start");
      await Promise.all(promises);
      log("mid process ended");

      if (isVideoUrlMp4) {
        fs.unlinkSync(videoOutputPath);
        fs.renameSync(midProcessVideoOutputPath, videoOutputPath);
        log("deleted unprocessed video");
      }

      if (isAudioUrlMp4) {
        fs.unlinkSync(audioOutput);
        fs.renameSync(midProcessAudioOutputPath, audioOutput);
        log("deleted unprocessed audio");
      }
    }

    const videoDuration = videoEndTime - videoStartTime;
    const audioDuration = audioEndTime - audioStartTime;
    // Use fluent-ffmpeg to merge the video and audio files
    await new Promise((resolve) => {
      ffmpeg()
        .addInput(videoOutputPath)
        .seekInput(videoStartTime) // start time in seconds
        .addOptions(`-t ${videoDuration}`) // duration in seconds
        .input(audioOutputPath)
        .seekInput(audioStartTime) // start time in seconds
        .addOptions(`-t ${audioDuration}`) // duration in seconds
        .addOutputOption("-shortest")
        .output(finalOutputPath)
        .on("end", resolve)
        .run();
    });

    log("final output ready");
    await callback(finalOutputPath);
  } catch (err) {
    throw err;
  } finally {
    // clean up files
    fs.unlink(videoOutputPath, function (err) {});
    fs.unlink(audioOutputPath, function (err) {});
    fs.unlink(finalOutputPath, function (err) {});
    fs.unlink(midProcessAudioOutputPath, function (err) {});
    fs.unlink(midProcessVideoOutputPath, function (err) {});
    log("cleaned up files");
  }
}

async function isUrlMP4(url) {
  return new Promise((resolve) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const contentType = response.headers["content-type"];
        if (
          contentType &&
          (contentType.includes("video/mp4") ||
            contentType.includes("video/mp3") ||
            contentType.includes("video/aac") ||
            contentType.includes("video/wav"))
        ) {
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  });
}

function removeVideoAndExtractAudio(inputFilePath, outputAudioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputFilePath)
      .output(outputAudioPath)
      .audioCodec("libmp3lame") // Use the MP3 audio codec
      .noVideo() // Remove video
      .on("end", () => {
        log("Video removed, and audio extracted as MP3 successfully");
        resolve();
      })
      .on("error", (err) => {
        log("Error: " + err);
        reject(err);
      })
      .run();
  });
}

function removeVideo(inputFilePath, outputFilePath) {}

function removeAudio(inputFilePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputFilePath)
      .output(outputFilePath)
      .noAudio() // Remove audio from the video
      .on("end", () => {
        log("Audio removed successfully");
        resolve();
      })
      .on("error", (err) => {
        log("Error: " + err);
        reject(err);
      })
      .run();
  });
}

module.exports = { downloadVideoAndAudio };

// async function init() {
//   await downloadVideoAndAudio(
//     "https://www.youtube.com/watch?v=c1HeRtKk86U",
//     "https://www.youtube.com/watch?v=f0-RYStvdkc",
//     0,
//     25,
//     120,
//     160,
//     (outputPath) => {
//       console.log(fs.existsSync(outputPath));
//     }
//   );
// }
// init();

// setTimeout(() => {}, 50000000);
