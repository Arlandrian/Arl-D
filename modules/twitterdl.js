const puppeteer = require("puppeteer");
const ffmpeg = require("fluent-ffmpeg");
const { Channel } = require("./chan.js");

const twitterStatusUrlRegex =
  /^https?:\/\/twitter|x\.com\/(\w+)\/status(es)?\/(\d+)/;

function isTwitterStatusUrl(url) {
  return twitterStatusUrlRegex.test(url);
}

// process.on("SIGTERM", gracefulShutdown);
// process.on("SIGINT", gracefulShutdown);

function gracefulShutdown() {
  if (browser != null) {
    browser.close()
    setTimeout(() => {
      console.error('Forcefully terminating after 10 seconds.');
      process.exit(1); 
    }, 10000);
  }
  twitterHlsChan.close()
}

class TwitterVideoTicket {
  constructor(statusUrl, outputPath, onFinished) {
    this.statusUrl = statusUrl;
    this.outputPath = outputPath;
    this.onFinished = onFinished;
  }
}

const twitterHlsChan = new Channel();
async function initPuppeteerRequestConsumer() {
  while (twitterHlsChan.closed==null) {
    const ticket = await twitterHlsChan.receive();
    if (ticket == null) {
      continue
    }
    console.log("retrieving hls for " + ticket.statusUrl)
    console.time("hls")
    const hlsUrl = await consumePuppeteerRequest(ticket.statusUrl, ticket.outputPath);
    console.timeEnd("hls");
    if(hlsUrl!=null){
      console.log("got the hls url for " + ticket.statusUrl + ". hls:" + hlsUrl);
    }else{
      console.log("couldnt find hls url for " + ticket.statusUrl);
    }
    await ticket.onFinished(hlsUrl)
  }
}

// initPuppeteerRequestConsumer();

function downloadTwitterVideoAsync(url, outputPath) {
  return new Promise(async (resolve) => {
    if (!isTwitterStatusUrl(url)) {
      throw new Error("url not a twitter status.");
    }

    const ticket = new TwitterVideoTicket(url, outputPath, async (hlsUrl)=>{
      if (hlsUrl == null) {
        throw new Error("couldnt find the video on page.");
      }
      console.log("downloading video with downloaded hls");
      console.time("twdl")
      await downloadHlsManifestAsVideo(hlsUrl, outputPath);
      console.timeEnd("twdl");
      console.log("twitter video downloaded "+ url);
      resolve()
    });
    
    twitterHlsChan.send(ticket)
  });
}

const FREE_BROWSER_TIMEOUT = 10*60000;
let browser;
let browserLastUsedTime;

async function getBrowserPuppeteer() {
  if (browser == null) {
    browser = await puppeteer.launch({
      headless: "new",
      timeout: 120000,
      userDataDir: "/dev/null",
      args: [
        // "--no-sandbox", // Disable sandboxing (useful in some environments)
        // "--disable-gpu", // Disable GPU support
        // "--disable-software-rasterizer", // Disable software rasterizer
        "--disable-dev-shm-usage", // Disable /dev/shm usage (often needed in containerized environments)
        // "--no-zygote", // Disable the zygote process for forking
        // "--disable-javascript",
        // "--blink-settings=imagesEnabled=false", // Disable loading of images
        // "--blink-settings=styleSheetsEnabled=false", // Disable loading of stylesheets
        '--incognito',
      ],
    });

    freeResourceInterval = setInterval(async () => {
      if (browser == null) {
        clearInterval(freeResourceInterval);
        return;
      }

      if (browserLastUsedTime == null) {
        clearInterval(freeResourceInterval);
        return;
      }

      if (browserLastUsedTime + FREE_BROWSER_TIMEOUT > Date.now()) {
        return;
      }

      await browser.close();
      browser = null;
      clearInterval(freeResourceInterval);
      console.log(
        `Browser has not been used for ${
          FREE_BROWSER_TIMEOUT / 60000
        } minutes, closing the browser instance to free resources.`
      );
      
    }, FREE_BROWSER_TIMEOUT);
  }
  browserLastUsedTime = Date.now();
  return browser;
}

async function consumePuppeteerRequest(statusUrl) {
  const browser = await getBrowserPuppeteer();
  const [page] = await browser.pages();
  let hlsManifest = null;
  try {
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const rUrl = request.url();
      if (rUrl.includes("video.twimg.com/ext_tw_video") || rUrl.includes("video.twimg.com/amplify_video")) {
        if(hlsManifest!=null){
          return;
        }
        hlsManifest = rUrl;
        request.abort();
      } else {
        request.continue();
      }
    });

    // Wait for the page to load and the video element to be present
    page
      .waitForSelector("video")
      .then((video) => {
        if (hlsManifest == null) {
          video.click();
        }
      })
      .catch((err) => {
        if (err.name != "TargetCloseError") {
          throw err;
        }
      });
      
    // Navigate to the URL
    await page.goto(statusUrl, { waitUntil: "networkidle0", timeout: 120000 });
  } 
  catch(err){
    console.log(err)
  }
  finally {
    page.removeAllListeners('request');
  }
  return hlsManifest
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

// // TODO-1: remove
// function logMemoryUsage() {
//   const memoryUsage = process.memoryUsage();
//   console.log(`Memory usage: ${JSON.stringify(memoryUsage)}`);
// }

// // Log memory usage every 10 seconds
// const intervalId = setInterval(logMemoryUsage, 100);
// logMemoryUsage();

module.exports = {downloadTwitterVideoAsync,isTwitterStatusUrl};

// (async ()=>{
//   console.time("total")
//   await downloadTwitterVideoAsync("https://x.com/animaIarmy/status/1725913900468556223", "10sec.mp4");
//   await downloadTwitterVideoAsync("https://x.com/ayiogluayi0/status/1725993560061653008?s=20", "30sec.mp4");
//   console.timeEnd("total")
// })()

// TODO: kill doesnt kill process in run.sh gracefull