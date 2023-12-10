const { Scraper } = require("@the-convocation/twitter-scraper");
const ffmpeg = require("fluent-ffmpeg");
const scraper = new Scraper();
const twitterStatusUrlRegex =
  /^https?:\/\/twitter|x\.com\/(\w+)\/status(es)?\/(\d+)/;

function isTwitterStatusUrl(url) {
  return twitterStatusUrlRegex.test(url);
}

function getTweetIdFromUrl(url) {
  const matches = twitterStatusUrlRegex.exec(url);
  if (matches != null) {
    return matches[3];
  }
}

async function downloadTwitterVideoAsync(url, outputFileName) {
  const tweetId = getTweetIdFromUrl(url)
  await scraper.getTweet(tweetId)
  return new Promise((resolve)=>{
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

// (async () => {
//   console.time("total");
//   await downloadTwitterVideoAsync(
//     "https://x.com/ayiogluayi0/status/1725993560061653008?s=20",
//     "30sec.mp4"
//   );
//   console.timeEnd("total");
// })();

module.exports = { downloadTwitterVideoAsync, isTwitterStatusUrl };
