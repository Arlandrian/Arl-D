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

const twitterStatusUrlRegex =
  /^https?:\/\/twitter|x\.com\/(\w+)\/status(es)?\/(\d+)/;

const MAX_VIDEO_MS = 20 * 60 * 1000;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MIN_REQ_MEMORY_BYTES = 64 * 1024 * 1024;

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
    let promises = [];
    const isVideoTwitter = isTwitterStatusUrl(videoUrl);
    const isAudioTwitter = isTwitterStatusUrl(audioUrl);
    log("isVideoTwitter", isVideoTwitter, "isAudioTwitter", isAudioTwitter);

    let isVideoUrlMp4 = false;
    let isAudioUrlMp4 = false;
    if (!isVideoTwitter || !isAudioTwitter) {
      const pRes = await Promise.all([isUrlMP4(videoUrl), isUrlMP4(audioUrl)]);
      isVideoUrlMp4 = pRes[0];
      isAudioUrlMp4 = pRes[1];
    }
    log("isVideoUrlMp4", isVideoUrlMp4, "isAudioUrlMp4", isAudioUrlMp4);

    let videoNeedsMidProcess = isVideoUrlMp4 || isVideoTwitter;
    let audioNeedsMidProcess = isAudioUrlMp4 || isAudioTwitter;

    let videoPromise = null;
    if (isVideoTwitter) {
      videoPromise = downloadTwitterVideoAsync(videoUrl, videoOutputPath);
    } else if (isVideoUrlMp4) {
      videoPromise = downloadMp4UrlAsync(videoUrl, videoOutputPath);
    } else {
      videoPromise = downloadYoutubeVideoAsync(videoUrl, videoOutputPath);
    }
    log("video promise created");

    let audioPromise = null;
    if (isAudioTwitter) {
      audioPromise = downloadTwitterVideoAsync(audioUrl, videoOutputPath);
    } else if (isAudioUrlMp4) {
      audioPromise = downloadMp4UrlAsync(audioUrl, videoOutputPath);
    } else {
      audioPromise = downloadYoutubeAudioAsync(audioUrl, videoOutputPath);
    }
    log("audio promise created");

    // wait for the audio file download to finish
    await Promise.all([videoPromise, audioPromise]);
    log("videos are downloaded");

    // middle processing
    // 1. remove audio from the video
    // 2. write it to a temp file
    // 3. delete old file
    // 4. rename new file to old file
    // 5. vice-versa for audio file
    promises = [];
    if (videoNeedsMidProcess) {
      promises.push(removeAudio(videoOutputPath, midProcessVideoOutputPath));
    }

    if (audioNeedsMidProcess) {
      promises.push(removeVideo(audioOutputPath, midProcessAudioOutputPath));
    }

    if (promises.length > 0) {
      log("mid process start");
      await Promise.all(promises);
      log("mid process ended");

      if (videoNeedsMidProcess) {
        fs.unlinkSync(videoOutputPath);
        fs.renameSync(midProcessVideoOutputPath, videoOutputPath);
        log("deleted unprocessed video");
      }

      if (audioNeedsMidProcess) {
        fs.unlinkSync(audioOutputPath);
        fs.renameSync(midProcessAudioOutputPath, audioOutputPath);
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
    throw new Error(err.name);
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

function isUrlMP4(url) {
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
function removeVideo(inputFilePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputFilePath)
      .output(outputFilePath)
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

async function downloadMp4UrlAsync(url, outputPath) {
  stream = (await axios.get(url, { responseType: "stream" })).data;
  await mediaStreamToFileAsync(stream, outputPath);
}

////////////////////////////////////////////////////////////
//////   Youtube    ////////////////////////////////////////
////////////////////////////////////////////////////////////

async function downloadYoutubeVideoAsync(url, outputPath) {
  // Download video without audio
  stream = ytdl(url, {
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

  return mediaStreamToFileAsync(stream, outputPath);
}

async function downloadYoutubeAudioAsync(url, outputPath) {
  // Download audio only
  stream = ytdl(url, {
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
  return mediaStreamToFileAsync(stream, outputPath);
}

////////////////////////////////////////////////////////////
//////   Twitter    ////////////////////////////////////////
////////////////////////////////////////////////////////////
function isTwitterStatusUrl(url) {
  return twitterStatusUrlRegex.test(url);
}

async function downloadTwitterVideoAsync(url, outputPath) {
  if (!isTwitterStatusUrl(url)) {
    throw new Error("url not a twitter status.");
  }
  log("retrieving hls")
  const hlsUrl = await getTwitterVideoHlsUrlFromStatusUrl(url);
  log("got the hls url")
  if (hlsUrl == null) {
    throw new Error("couldnt find the video on page.");
  }
  await downloadHlsManifestAsVideo(hlsUrl, outputPath);
  log("twitter video downloaded")
}

async function getTwitterVideoHlsUrlFromStatusUrl(url) {
  const browser = await puppeteer.launch({ headless: "new" });
  const [page] = await browser.pages();
  let hlsManifest = null;
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const r_url = request.url();
    if (r_url.includes("video.twimg.com/ext_tw_video")) {
      hlsManifest = r_url;
      request.abort();
    } else {
      request.continue();
    }
  });

  // Wait for the page to load and the video element to be present
  page
    .waitForSelector("video")
    .then((video) => {
      video.click();
    })
    .catch((err) => {
      if (err.name != "TargetCloseError") {
        throw err;
      }
    });

  // Navigate to the URL
  await page.goto(url, { waitUntil: "networkidle0", timeout: 10000 });
  await browser.close();
  return hlsManifest;
}

function downloadHlsManifestAsVideo(hlsManifestUrl, outputFileName) {
  return new Promise((resolve, reject) => {
    // Download and convert HLS stream to a local file
    ffmpeg()
      .addInput(hlsManifestUrl)
      .addOptions("-c:v copy") // Copy video codec
      .addOptions("-c:a copy") // Copy audio codec
      .addOptions("-bsf:a aac_adtstoasc") // Convert AAC stream to ADTS format
      .output(outputFileName)
      .on("end", () => {
        resolve();
      })
      .on("error", (err) => {
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
(async () => {
  async function foo(path) {
    await downloadMp4UrlAsync("https://cdn.discordapp.com/attachments/1008121612173848666/1169322667871043654/oof.darn-20220929-0002.mp4?ex=6554fb98&is=65428698&hm=6e7446543acb799b5b720ae328aaa9aa24da1549c9fdfa4fa19a0b6ec8979a49&",path)
    console.log(path,"finished")
  
  }

  const list = [];
  list.push(foo("1.mp4"));
  list.push(foo("2.mp4"));
  list.push(foo("3.mp4"));
  await Promise.all(list);
  console.log("all finished")
})();