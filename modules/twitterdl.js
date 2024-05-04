const { Scraper } = require("@the-convocation/twitter-scraper");
const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");

const twitterStatusUrlRegex =
  /^https?:\/\/(twitter|x).com\/(\w+)\/status(es)?\/(\d+)/;

function isTwitterStatusUrl(url) {
  return twitterStatusUrlRegex.test(url);
}

function getTweetIdFromUrl(url) {
  const matches = twitterStatusUrlRegex.exec(url);
  if (matches != null) {
    return matches[4];
  }
}

async function downloadTwitterVideoAsync(url, outputFileName) {
  
  return new Promise((resolve, reject)=>{
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
  })
}

async function getVideoStream(url) {
  const tweetId = getTweetIdFromUrl(url);
  const scraper = new Scraper();
  const tweetInfo = await scraper.getTweet(tweetId);
  const hlsManifestUrl = tweetInfo.videos[0].url;
  const resp = await axios.get(hlsManifestUrl, { responseType: "stream" })
  return resp.data
}

// (async () => {
//   console.time("total");
//   await downloadTwitterVideoAsync(
//     "https://x.com/ayiogluayi0/status/1725993560061653008?s=20",
//     //"https://twitter.com/yscrsf/status/1733816205570420952",
//     "30sec.mp4"
//   );
//   console.timeEnd("total");
// })();

module.exports = { getVideoStream, downloadTwitterVideoAsync, isTwitterStatusUrl };
