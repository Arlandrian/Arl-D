const { LiveChat } = require("youtube-chat")

if (process.env.YOUTUBE_CHANNEL_ID == undefined) {
  return
}
//Enum
const StreamStatus = {
  OnAir: "OnAir",
  OffAir: "OffAir"
}
// UCQ884T-8XZwS5Xlv6RkfJCg
const liveChat = new LiveChat({ channelId: process.env.YOUTUBE_CHANNEL_ID })

let streamStatus = StreamStatus.OffAir;
let working = false;
let currentLiveStreamId = null

const StartMainLoop = async () => {
  working = true
  console.log("Started youtube main loop...")
  while (working) {
    await new Promise(r => setTimeout(r, 5000));
    switch (streamStatus) {
      case StreamStatus.OffAir:
        await OffAirState();
        break;
      case StreamStatus.OnAir:
        await OnAirState()
        break;
    }
  }
}

const StopMainLoop = () => {
  working = false
}

const OnAirState = async () => {
  // do nothing for now
}

const OffAirState = async () => {
  let didFoundStream = await liveChat.start()
}

const init = async () => {
  // Emit at start of observation chat.
  // liveId: string
  liveChat.on("start", (liveId) => {
    /* Your code here! */
    console.log("live stream started: " + liveId)
    streamStatus = StreamStatus.OnAir;
    currentLiveStreamId = liveId
  })

  // Emit at end of observation chat.
  // reason: string?
  liveChat.on("end", (reason) => {
    /* Your code here! */
    console.log("live stream ended. reason: " + reason)
    streamStatus = StreamStatus.OffAir;
    currentLiveStreamId = null
  })

  // Emit at receive chat.
  // chat: ChatItem
  liveChat.on("chat", (chatItem) => {
    /* Your code here! */
    console.log(chatItem.message)
  })

  // Emit when an error occurs
  // err: Error or any
  liveChat.on("error", (err) => {
    /* Your code here! */
    if(err == "Live Stream was not found"){
      // this is expected
      return;
    }

    console.error(err)
  })

  await StartMainLoop()
}

init()
