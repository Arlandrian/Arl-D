const axios = require("axios");
const { TiktokDL } = require("@tobyg74/tiktok-api-dl");

const tiktokUrlRegex =
  /^.*https:\/\/(?:m|www|vm)?\.?tiktok\.com\/((?:.*\b(?:(?:usr|v|embed|user|video)\/|\?shareId=|\&item_id=)(\d+))|\w+)/;

function isTiktokUrl(url) {
  return tiktokUrlRegex.test(url);
}

async function getVideoStream(url, outputPath) {
  resp = await TiktokDL(url, {
    version: "v3", //  version: "v1" | "v2" | "v3"
  });
  if (resp.status != "success") {
    throw new Error(
      "failed to download tiktok video. err: " + JSON.stringify(resp)
    );
  } else {
    const mediaUrl = resp.result.video1;
    const stream = (await axios.get(mediaUrl, { responseType: "stream" })).data;
    return stream
  }
}

module.exports = { getVideoStream, isTiktokUrl };
