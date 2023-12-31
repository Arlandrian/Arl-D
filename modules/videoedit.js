/* eslint-disable linebreak-style */
/* eslint-disable no-useless-catch */
/* eslint-disable space-before-function-paren */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const os = require("os");
const axios = require("axios");
const https = require("https");
const twitterdl = require("./twitterdl.js");
const ffmpegExec = require("./ffmpeg.js");
const { TiktokDL } = require("@tobyg74/tiktok-api-dl");

const tiktokUrlRegex =
  /^.*https:\/\/(?:m|www|vm)?\.?tiktok\.com\/((?:.*\b(?:(?:usr|v|embed|user|video)\/|\?shareId=|\&item_id=)(\d+))|\w+)/;

// get temp directory
const tempDir = os.tmpdir();

const MAX_VIDEO_SEC = 20 * 60;
const MAX_VIDEO_MS = 20 * 60 * 1000;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MIN_REQ_MEMORY_BYTES = 64 * 1024 * 1024;
const MAX_VIDEO_BITRATE = 440000;

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
const fsErr = (err) => {
  if (err != null) console.error("fs-err:" + err);
};

// final output will return a file path in the temp folder,
async function downloadVideo(
  videoUrl,
  videoStartTime,
  videoEndTime,
  ffmpegOpts,
  callback
) {
  if (os.freemem() < MIN_REQ_MEMORY_BYTES) {
    throw new Error("Not enough memory available on the machine.");
  }
  if (ffmpegOpts != "" && !isValidFFmpegOpts(ffmpegOpts)) {
    throw new Error(
      `Invalid ffmpeg options: ${ffmpegOpts} \nhttps://tenor.com/view/kadir-hoca-kadir-hoca-amına-koyim-amına-koyayım-gif-16806695897421624124\n`
    );
  }
  videoEndTime = videoEndTime == 0 ? MAX_VIDEO_SEC : videoEndTime;
  const timestamp = new Date().getTime();
  const timeLogLabel = `ts_${timestamp}`;
  const videoOutputPath = `${tempDir}/video_${timestamp}.mp4`;
  const finalOutputPath = `${tempDir}/final_${timestamp}.mp4`;

  if (videoStartTime < 0 || videoEndTime <= videoStartTime) {
    throw new Error("Invalid time range");
  }
  try {
    const isVideoTwitter = twitterdl.isTwitterStatusUrl(videoUrl);
    const isVideoTiktok = isTiktokMediaUrl(videoUrl);
    let isVideoUrlMp4 = false;
    if (!isVideoTwitter && !isVideoTiktok) {
      isVideoUrlMp4 = await isUrlRawMedia(videoUrl);
    }
    let videoPromise = null;
    if (isVideoTwitter) {
      videoPromise = twitterdl.downloadTwitterVideoAsync(
        videoUrl,
        videoOutputPath
      );
    } else if (isVideoTiktok) {
      videoPromise = downloadTiktokVideoAsync(videoUrl, videoOutputPath);
    } else if (isVideoUrlMp4) {
      videoPromise = downloadMp4UrlAsync(videoUrl, videoOutputPath);
    } else {
      videoPromise = downloadYoutube(videoUrl, videoOutputPath);
    }

    console.time(timeLogLabel);
    await Promise.all([videoPromise]);
    console.timeLog(timeLogLabel);
    log("video downloaded");

    const needsPostProcess =
      videoStartTime != 0 || videoEndTime != MAX_VIDEO_SEC || ffmpegOpts != "";
    if (!needsPostProcess) {
      fs.renameSync(videoOutputPath, finalOutputPath);
    } else {
      const videoDuration = videoEndTime - videoStartTime;
      let args = "";
      if (ffmpegOpts == "") {
        args = `-i ${videoOutputPath} -ss ${videoStartTime} -t ${videoDuration} -c:v libx264 -preset ultrafast -c:a copy -threads 8 ${finalOutputPath}`;
      } else {
        args = `-i ${videoOutputPath} ${ffmpegOpts} -threads 4 ${finalOutputPath}`;
      }
      const err = await ffmpegExec(args);
      if (err != null) {
        throw err;
      }
    }
    console.timeLog(timeLogLabel);
    log("final output ready");
    await callback(finalOutputPath);
    log("callback called");
    console.timeLog(timeLogLabel);
  } catch (err) {
    throw err;
  } finally {
    // clean up files
    fs.unlink(videoOutputPath, fsErr);
    fs.unlink(finalOutputPath, fsErr);
    log("cleaned up files");
    console.timeEnd(timeLogLabel);
  }
}

async function downloadVideoAsMp3(
  videoUrl,
  videoStartTime,
  videoEndTime,
  callback
) {
  if (os.freemem() < MIN_REQ_MEMORY_BYTES) {
    throw new Error("Not enough memory available on the machine.");
  }

  videoEndTime = videoEndTime == 0 ? MAX_VIDEO_SEC : videoEndTime;
  const timestamp = new Date().getTime();
  const timeLogLabel = `ts_${timestamp}`;
  const videoOutputPath = `${tempDir}/video_${timestamp}.mp4`;
  const finalOutputPath = `${tempDir}/final_${timestamp}.aac`;
  let needsEncoding = true;
  if (videoStartTime < 0 || videoEndTime <= videoStartTime) {
    throw new Error("Invalid time range");
  }
  try {
    const isVideoTwitter = twitterdl.isTwitterStatusUrl(videoUrl);
    let isVideoUrlRawMedia = false;
    if (!isVideoTwitter) {
      isVideoUrlRawMedia = await isUrlRawMedia(videoUrl);
    }
    let videoPromise = null;
    if (isVideoTwitter) {
      videoPromise = twitterdl.downloadTwitterVideoAsync(
        videoUrl,
        videoOutputPath
      );
    } else if (isVideoUrlRawMedia) {
      videoPromise = downloadMp4UrlAsync(videoUrl, videoOutputPath);
    } else {
      needsEncoding = false;
      videoPromise = downloadYoutube(videoUrl, videoOutputPath, false, true);
    }

    console.time(timeLogLabel);
    await Promise.all([videoPromise]);
    console.timeLog(timeLogLabel);
    log("video downloaded");

    const needsCut = videoStartTime != 0 || videoEndTime != MAX_VIDEO_SEC;

    let ffmpegArgs = "-i ${videoOutputPath}";
    if (needsCut) {
      const videoDuration = videoEndTime - videoStartTime;
      ffmpegArgs += ` -ss ${videoStartTime} -t ${videoDuration}`;
    }
    if (needsEncoding) {
      const err = await ffmpegExec(
        `${ffmpegArgs} -vn -c:a aac ${finalOutputPath}`
      );
      if (err != null) {
        throw err;
      }
    } else {
      if (needsCut) {
        const err = await ffmpegExec(
          `${ffmpegArgs} -vn -c:a aac ${finalOutputPath}`
        );
        if (err != null) {
          throw err;
        }
      } else {
        fs.renameSync(videoOutputPath, finalOutputPath);
      }
    }

    console.timeLog(timeLogLabel);
    log("final output ready");
    await callback(finalOutputPath);
    log("callback called");
    console.timeLog(timeLogLabel);
  } catch (err) {
    throw err;
  } finally {
    // clean up files
    fs.unlink(videoOutputPath, fsErr);
    fs.unlink(finalOutputPath, fsErr);
    log("cleaned up files");
    console.timeEnd(timeLogLabel);
  }
}

// final output will return a file path in the temp folder,
// user of this function has to clean up the
async function downloadVideoAndAudioEdit(
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
  const timeLogLabel = `ts_${timestamp}`;
  const videoOutputPath = `${tempDir}/video_${timestamp}.mp4`;
  const audioOutputPath = `${tempDir}/audio_${timestamp}.mp4`;
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
  try {
    const isVideoTwitter = twitterdl.isTwitterStatusUrl(videoUrl);
    const isAudioTwitter = twitterdl.isTwitterStatusUrl(audioUrl);
    log(
      "isVideoTwitter:" + isVideoTwitter + ", isAudioTwitter:" + isAudioTwitter
    );

    let isVideoUrlMp4 = false;
    let isAudioUrlMp4 = false;
    if (!isVideoTwitter || !isAudioTwitter) {
      const pRes = await Promise.all([
        isUrlRawMedia(videoUrl),
        isUrlRawMedia(audioUrl),
      ]);
      isVideoUrlMp4 = pRes[0];
      isAudioUrlMp4 = pRes[1];
    }
    log("isVideoUrlMp4:" + isVideoUrlMp4 + ", isAudioUrlMp4:" + isAudioUrlMp4);

    let videoPromise = null;
    if (isVideoTwitter) {
      videoPromise = twitterdl.downloadTwitterVideoAsync(
        videoUrl,
        videoOutputPath
      );
    } else if (isVideoUrlMp4) {
      videoPromise = downloadMp4UrlAsync(videoUrl, videoOutputPath);
    } else {
      videoPromise = downloadYoutube(
        videoUrl,
        videoOutputPath,
        (hasAudio = true),
        (hasVideo = false)
      );
    }
    log("video promise created");

    if (isAudioTwitter) {
      audioPromise = twitterdl.downloadTwitterVideoAsync(
        audioUrl,
        audioOutputPath
      );
    } else if (isAudioUrlMp4) {
      audioPromise = downloadMp4UrlAsync(audioUrl, audioOutputPath);
    } else {
      audioPromise = downloadYoutube(
        audioUrl,
        audioOutputPath,
        (hasVideo = false),
        (hasAudio = true)
      );
    }
    log("audio promise created");
    console.time(timeLogLabel);
    // wait for the audio file download to finish
    await Promise.all([videoPromise, audioPromise]);
    log("videos are downloaded");
    console.timeLog(timeLogLabel);
    const videoDuration = videoEndTime - videoStartTime;
    const audioDuration = audioEndTime - audioStartTime;
    const shortest = Math.min(videoDuration, audioDuration);
    const err = await ffmpegExec(
      `-ss ${videoStartTime} -t ${shortest} -i ${videoOutputPath} -ss ${audioStartTime} -t ${shortest} -i ${audioOutputPath} -c:v libx264 -preset ultrafast -c:a copy -map 0:v:0 -map 1:a:0 -map 1:a:0 -shortest -threads 8 ${finalOutputPath}`
    );
    if (err != null) {
      throw err;
    }
    log("final output ready");
    console.timeLog(timeLogLabel);
    await callback(finalOutputPath);
    log("callback called");
    console.timeLog(timeLogLabel);
  } catch (err) {
    throw err;
  } finally {
    // clean up files
    fs.unlink(videoOutputPath, fsErr);
    fs.unlink(audioOutputPath, fsErr);
    fs.unlink(finalOutputPath, fsErr);
    log("cleaned up files");
    console.timeEnd(timeLogLabel);
  }
}

function isUrlRawMedia(url) {
  return new Promise((resolve) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const contentType = response.headers["content-type"];
        if (
          contentType &&
          (contentType.includes("video/mp4") ||
            contentType.includes("video/webm") ||
            contentType.includes("video/ogg") ||
            contentType.includes("audio/mpeg") ||
            contentType.includes("audio/aac") ||
            contentType.includes("audio/ogg") ||
            contentType.includes("audio/flac") ||
            contentType.includes("audio/wav"))
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

////////////////////////////////////////////////////////////
//////   MidProccess  //////////////////////////////////////
////////////////////////////////////////////////////////////

// turn video to audio only file
async function removeVideo(inputFilePath, outputFilePath) {
  const args = `-y -i ${inputFilePath} -vn -c:a aac -threads 4 ${outputFilePath}`;
  const err = await ffmpegExec(args);
  if (err != null) {
    return;
  }
  log("Video removed successfully");
}

async function removeAudio(inputFilePath, outputFilePath) {
  const args = `-y -i ${inputFilePath} -c:v copy -an -threads 4 ${outputFilePath}`;
  const err = await ffmpegExec(args);
  if (err != null) {
    return;
  }
  log("Audio removed successfully");
}

////////////////////////////////////////////////////////////
//////   Mp4Urls    ////////////////////////////////////////
////////////////////////////////////////////////////////////

function mediaStreamToFileAsync(stream, outputPath) {
  let videoSize = 0;
  stream.on("data", (chunk) => {
    videoSize += chunk.length;
    if (videoSize > MAX_VIDEO_BYTES) {
      stream.destroy();
      throw new Error("Video file too large");
    }
  });
  const videoOutput = fs.createWriteStream(outputPath);
  stream.pipe(videoOutput);
  return new Promise((resolve) => {
    videoOutput.on("close", resolve);
  });
}

function downloadMp4UrlAsync(url, outputPath) {
  return new Promise(async (resolve) => {
    stream = (await axios.get(url, { responseType: "stream" })).data;
    await mediaStreamToFileAsync(stream, outputPath);
    resolve();
  });
}

////////////////////////////////////////////////////////////
//////   Youtube    ////////////////////////////////////////
////////////////////////////////////////////////////////////

const chooseVideoFormat = async (url, hasVideo = true, hasAudio = true) => {
  const info = await ytdl.getInfo(url);
  const filtered = info.formats.filter((format) => {
    return (
      format.hasVideo == hasVideo &&
      format.hasAudio == hasAudio &&
      format.approxDurationMs < MAX_VIDEO_MS &&
      format.bitrate < MAX_VIDEO_BITRATE
    );
  });
  // pick the element with the highest bitrate
  return filtered.reduce((a, b) => (a && a.bitrate > b.bitrate ? a : b), null);
};

async function downloadYoutube(url, outputPath, hasVideo, hasAudio) {
  const format = await chooseVideoFormat(url, hasVideo, hasAudio);
  stream = ytdl(url, { format: format });
  return mediaStreamToFileAsync(stream, outputPath);
}

////////////////////////////////////////////////////////////
//////   Tiktok    ////////////////////////////////////////
////////////////////////////////////////////////////////////

function isTiktokMediaUrl(url) {
  return tiktokUrlRegex.test(url);
}

async function downloadTiktokVideoAsync(url, outputPath) {
  resp = await TiktokDL(url, {
    version: "v1", //  version: "v1" | "v2" | "v3"
  });
  if (resp.status != "success") {
    throw new Error("failed to download tiktok video. err: " + JSON.stringify(resp));
  } else {
    const mediaUrl = resp.result.video[0];
    stream = (await axios.get(mediaUrl, { responseType: "stream" })).data;
    await mediaStreamToFileAsync(stream, outputPath);
  }
}

function isValidFFmpegOpts(opts) {
  // Regex pattern for FFmpeg options
  const ffmpegOptsRegex = /^[a-zA-Z0-9\[\]_:-\s]+$/;
  return ffmpegOptsRegex.test(opts);
}

module.exports = {
  downloadVideo,
  downloadVideoAsMp3,
  downloadVideoAndAudioEdit,
};
// (async () => {
//   console.time("total");
//   //   const vurl = "https://www.youtube.com/watch?v=YrtCnL62pB8"
//   //   const aurl = "https://www.youtube.com/watch?v=f0-RYStvdkc"
//   const vurl = "https://www.tiktok.com/@naturliflove/video/7300167273786903841";
//   const aurl = "https://x.com/ME_1948_Updates/status/1733687260678128025?s=20";
//   const vs = 0;
//   const ve = 0;
//   const as = 0;
//   const ae = 9;
//   const err = await downloadVideo(vurl, vs, ve, "",(final)=>{
//     console.log("ready: ", final)
//     fs.copyFile(final, "final.mp4", fsErr)
//     console.timeEnd("total")
//   })
//   // await downloadVideo(vurl, vs, ve, '" ls ');
// })();
