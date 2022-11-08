const logger = require("../modules/logger.js");
const { LiveChat } = require("youtube-chat")
const youtubeService = require("./youtubeService")
const db = { getYoutubeBotConfig, setYoutubeBotConfig } = require("../modules/database.js")

const defaultBotConfig = {
  enabled: false,
  channelId: null,
  messageText: null,
  messageFreqSec: 120
}

let botConfig = {
  enabled: false,
  channelId: null,
  messageText: null,
  messageFreqSec: 120
}

//Enum
const StreamStatus = {
  OnAir: "OnAir",
  OffAir: "OffAir"
}

let liveChat = null

let streamStatus = StreamStatus.OffAir;
let working = false;
let currentLiveStreamId = null
let currentLiveChatId = null
let lastMessageSendDate = new Date()

const StartMainLoop = async () => {
  working = true
  logger.log("Started youtube bot with config: "+botConfig)
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
  let timePassedSec = (new Date() - lastMessageSendDate) / 1000
  if(timePassedSec > botConfig.messageFreqSec){
    await sendChatMessage(botConfig.messageText)
  }
}

const sendChatMessage = async (msg) => {
  if(currentLiveChatId == null){
    currentLiveChatId = await youtubeService.getActiveLiveChatId(currentLiveStreamId)
  }

  await youtubeService.sendLiveChatMessage(currentLiveChatId, msg)
}

const OffAirState = async () => {
  let didFoundStream = await liveChat.start()
}

const onStreamEnded = () => {
  streamStatus = StreamStatus.OffAir
  currentLiveStreamId = null
  currentLiveChatId = null
}

const initLiveChat = async () => {
  // Emit at start of observation chat.
  // liveId: string
  liveChat.on("start", (liveId) => {
    /* Your code here! */
    logger.log("live stream started: " + liveId)
    streamStatus = StreamStatus.OnAir;
    currentLiveStreamId = liveId
  })

  // Emit at end of observation chat.
  // reason: string?
  liveChat.on("end", (reason) => {
    /* Your code here! */
    logger.log("live stream ended. reason: " + reason)
    onStreamEnded()
  })

  // Emit at receive chat.
  // chat: ChatItem
  liveChat.on("chat", (chatItem) => {
    /* Your code here! */
    // logger.log(chatItem.message)
  })

  // Emit when an error occurs
  // err: Error or any
  liveChat.on("error", (err) => {
    /* Your code here! */
    if(err == "Live Stream was not found"){
      // this is expected
      if(streamStatus == StreamStatus.OnAir)
      {
        onStreamEnded()
      }
      return;
    }
    logger.error(err)
  })
}

const initLiveChatConfig = async () => {
  let config = await db.getYoutubeBotConfig()
  if(config == null){
    await db.setYoutubeBotConfig(defaultBotConfig)
  }
  botConfig = JSON.parse(JSON.stringify(defaultBotConfig))
}

const startLiveChat = async () => {
  if(working){
    return {error:"Live chat bot already working."}
  }

  if(botConfig.liveChat == null){
    botConfig = await db.getYoutubeBotConfig()
    if(botConfig == null){
      await initLiveChatConfig()
    }
  }

  if(botConfig.liveChat == null){
    return {error:"Channel Id is not set, use yt setchannelid your-channel-id"}
  }

  if(botConfig.messageText == null){
    return {error:"Chat Message is not set, use yt message your-channel-id"}
  }

  liveChat = new LiveChat({channelId: botConfig.channelId})
  initLiveChat()
  await StartMainLoop()
}

const stopLiveChat = async () => {
  if(!working){
    return {error:"Live chat bot is not working."}
  }
  StopMainLoop();
  liveChat.stop("Command");
  logger.log("Live chat bot stopped.")
}

const getLiveChatMessage = async () => {
  return botConfig.messageText
}

const setLiveChatMessage = async (textMessage) => {
  botConfig.messageText = textMessage
  await db.setYoutubeBotConfig(botConfig)
}

const getLiveChatFreqSec = async () => {
  return botConfig.messageFreqSec
}

const setLiveChatFreqSec = async (freq) => {
  botConfig.messageFreqSec = freq
  await db.setYoutubeBotConfig(botConfig)
}

const getLiveChatChannelId = async () => {
  return botConfig.channelId
}

const setLiveChatChannelId = async (channelId) => {
  if(botConfig.channelId == channelId){
    return {error:"ChannelId is already "+channelId}
  }
  botConfig.channelId = channelId
  await db.setYoutubeBotConfig(botConfig)
  await stopLiveChat();
  await startLiveChat();
}

const toggleLiveChat = async () =>{
  if(working){
    let result = {
      error: (await stopLiveChat()).error,
      working: working
    }
    return result;
  }else{
    let result = {
      error: (await startLiveChat()).error,
      working: working
    }
    return result;
  }
}

module.exports = { 
  toggleLiveChat,
  getLiveChatMessage, setLiveChatMessage,
  getLiveChatFreqSec, setLiveChatFreqSec,
  getLiveChatChannelId, setLiveChatChannelId
};
