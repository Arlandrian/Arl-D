const { google } = require('googleapis');
const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);
const youtube = google.youtube('v3');

function initAuth() {
  if (process.env.GOOGLE_REFRESH_TOKEN == null) {
    console.error("GOOGLE_REFRESH_TOKEN env var is not set, google features will be disabled!!!");
    return;
  }

  let tokens = {
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  }
  auth.forceRefreshOnFailure = true;
  auth.setCredentials(tokens);
  google.options({ auth });
}


let getActiveLiveChatId = async (videoId) => {
  let videoInfoResponse = await youtube.videos.list({
    id: videoId,
    part: "liveStreamingDetails"
  }).catch(err => {
    console.error(err);
  })
  return videoInfoResponse.data.items[0].liveStreamingDetails.activeLiveChatId
}

let sendLiveChatMessage = async (liveChatId, messageText) => {
  let response = await youtube.liveChatMessages.insert({
    part: 'snippet',
    resource: {
      snippet: {
        type: 'textMessageEvent',
        liveChatId: liveChatId,
        textMessageDetails: {
          messageText: messageText
        }
      }
    }
  }).catch(err => {
    console.error(err);
  })
}

initAuth()

module.exports = { initAuth, getActiveLiveChatId, sendLiveChatMessage }