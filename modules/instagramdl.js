const axios = require("axios");
const instagramDl = require("@sasmeee/igdl");

// Instagram URL'sini kontrol etmek için regex
const instagramUrlRegex =
  /((?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([^/?#&]+)).*/g;

function isInstagramUrl(url) {
  return instagramUrlRegex.test(url);
}

async function getVideoStream(url) {
  const mediaInfo = await instagramDl(url)
  const resp = await axios.get(mediaInfo[0].download_link, { responseType: "stream" })
  return resp.data
}

module.exports = { getVideoStream, isInstagramUrl };
