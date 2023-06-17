const logger = require("../modules/logger.js");
const { LiveChat } = require("youtube-chat")
const youtubeService = require("./youtubeService");
const { youtube } = require("googleapis/build/src/apis/youtube/index.js");
const db = { getYoutubeBotConfig, setYoutubeBotConfig } = require("../modules/database.js")

const MessagingMode = {
  MESSAGE_COUNTER : "MESSAGE_COUNTER",
  SECOND_BASED : "SECOND_BASED"
}

const defaultBotConfig = {
  enabled: false,
  channelId: null,
  messageText: null,
  messageFreqSec: 120,
  messageFreqCount: 60,
  mode: MessagingMode.SECOND_BASED
}

let botConfig = {
  enabled: false,
  channelId: null,
  messageText: null,
  messageFreqSec: 120,
  messageFreqCount: 60,
  mode: MessagingMode.SECOND_BASED
}

//Enum
const StreamStatus = {
  OnAir: "OnAir",
  OffAir: "OffAir",
  NotAvailable: "NotAvailable" // For some reason we're getting an error, so we will deactivate the live chat for some time
}

let liveChat = null

let streamStatus = StreamStatus.OffAir;
let working = false;
let currentLiveStreamId = null
let currentLiveChatId = null
let lastMessageSendDate = new Date()
let liveChatMessageCounter = 0

const NOTAVAILABLE_TIMEPAN = 1000*60*30;

initLiveChatConfig()

const StartMainLoop = async () => {
  working = true
  logger.log("Started youtube bot with config: "+JSON.stringify(botConfig))
  while (working) {
    await new Promise(r => setTimeout(r, 5000));
    switch (streamStatus) {
      case StreamStatus.OffAir:
        await OffAirState();
        break;
      case StreamStatus.OnAir:
        await OnAirState()
        break;
      case StreamStatus.NotAvailable:
        break;
    }
  }
}

const StopMainLoop = () => {
  working = false
}

const OnAirState = async () => {
  switch(botConfig.mode){
    case MessagingMode.SECOND_BASED:
    {
      let timePassedSec = (new Date() - lastMessageSendDate) / 1000
      if(timePassedSec > botConfig.messageFreqSec){
        await sendChatMessage(botConfig.messageText)
      }
    }
    break;
    case MessagingMode.MESSAGE_COUNTER:
    {
      let timePassedSec = (new Date() - lastMessageSendDate) / 1000
      if(
        timePassedSec > 15 && // wait at least 15 sec (this is also fixes the first bulk messages problem)
        liveChatMessageCounter >= botConfig.messageFreqCount // reached limit
        ){
        liveChatMessageCounter = 0
        await sendChatMessage(botConfig.messageText)
      }
    }
    break;
  }
}

const sendChatMessage = async (msg) => {
  if(currentLiveChatId == null){
    if(currentLiveStreamId == null){
      return
    }
    currentLiveChatId = await youtubeService.getActiveLiveChatId(currentLiveStreamId)
  }

  // HACK
  // youtube some how detects the messaage as spam and filter out on the live chat
  if (0.333 < Math.random()){
    let r = Math.random()
    if (0.333 < r){
      msg = msg.replace(":","::")
    }else if (0.666<r){
      msg = msg.replace(":","=>")
    }else{
      msg = msg.replace(":",">")
    }
  }

  // MORE HACK
  const possiblePrefixes = ["!", "+", "#", "$", "%", "&", "*", "-", "##", "$$", "%%", "&&"] 
  let pickedPrefix = getRandomElement(possiblePrefixes)
  msg = pickedPrefix + " " + msg

  let response = await youtubeService.sendLiveChatMessage(currentLiveChatId, msg)
  if(response!= null && response.error == 'The caller does not have permission'){
    logger.error("We are banned?, yaaay")
    logger.error("Deactivating the live chat watch.")
    toggleLiveChat()
    return
  }

  if(response != null && response.error != null){
    //&& response.error == 'The specified live chat is no longer live.'
    logger.error(response.error)
    onStreamEnded()
    //onStreamNotAvailable()
    return
  }
  
  lastMessageSendDate = new Date()
  logger.log(`[${lastMessageSendDate}] Sending chat message...`)
}

const OffAirState = async () => {
  let didFoundStream = await liveChat.start()
}

const onStreamEnded = () => {
  streamStatus = StreamStatus.OffAir
  currentLiveStreamId = null
  currentLiveChatId = null
  liveChatMessageCounter = 0
}

const onStreamNotAvailable = () =>{
  streamStatus = StreamStatus.NotAvailable
  setTimeout(()=> streamStatus = StreamStatus.OffAir, NOTAVAILABLE_TIMEPAN);
}

function getRandomElement(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

const initLiveChatEvents = async () => {
  // Emit at start of observation chat.
  // liveId: string
  liveChat.on("start", (liveId) => {
    /* Your code here! */
    logger.log("live stream started: " + liveId)
    streamStatus = StreamStatus.OnAir;
    currentLiveStreamId = liveId
    liveChatMessageCounter = 0
    sendChatMessage(botConfig.messageText)

    if(botConfig.mode != MessagingMode.MESSAGE_COUNTER){
      liveChat.stop("no need to watch chat")
    }
  })

  // Emit at end of observation chat. // ONLY CHAT
  // reason: string?
  liveChat.on("end", (reason) => {
    /* Your code here! */
    logger.log("stopped watching chat. reason: " + reason)
  })

  // Emit at receive chat.
  // chat: ChatItem
  liveChat.on("chat", (chatItem) => {
    /* Your code here! */
    // logger.log(chatItem.message)
    liveChatMessageCounter++;
  })

  // Emit when an error occurs
  // err: Error or any
  liveChat.on("error", (err) => {
    /* Your code here! */
    if(err.message == "Live Stream was not found"){
      // this is expected
      if(streamStatus == StreamStatus.OnAir)
      {
        logger.error("stopping live chat bot.")
        onStreamEnded()
      }
      return;
    }

    if(err.message == "Cannot read properties of undefined (reading '0')")
    {
      logger.error(err)
      if(streamStatus == StreamStatus.OnAir){
        logger.error("stopping live chat bot.")
        onStreamEnded()
        return;
      }
    }

    if(err.message == "Request failed with status code 404"){
      // this is expected
      if(streamStatus == StreamStatus.OnAir)
      {
        logger.error("stopping live chat bot.")
        onStreamEnded()
        return;
      }
    }

    if(err.message.endsWith("is finished live")){
      // this is expected
      if(streamStatus == StreamStatus.OnAir)
      {
        logger.error("stopping live chat bot.")
        onStreamEnded()
        return;
      }
    }

    logger.error(err)
  })
}

async function initLiveChatConfig (){
  let config = await db.getYoutubeBotConfig()
  if(config == null){
    await db.setYoutubeBotConfig(defaultBotConfig)
    config = JSON.parse(JSON.stringify(defaultBotConfig))
  }
  botConfig = config
  if(botConfig.enabled){
    let resp = await toggleLiveChat()
    if(resp.error != undefined){
      const reply = `Live chat bot toggle failed. Error: ${resp.error}`
      logger.error(reply)
      return;
    }
  }
}

const startLiveChat = async () => {
  if(working){
    return {error:"Live chat bot already working."}
  }

  if(botConfig.channelId == null){
    botConfig = await db.getYoutubeBotConfig()
    if(botConfig == null){
      await initLiveChatConfig()
    }
  }

  if(botConfig.channelId == null){
    return {error:"Channel Id is not set, use ytsetchannelid your-channel-id"}
  }

  if(botConfig.messageText == null){
    return {error:"Chat Message is not set, use ytsetmessage your-message"}
  }

  if(!youtubeService.validateChannelId(botConfig.channelId))
  {
    return {error:`Channel id \"${botConfig.channelId}\" could not found.`}
  }

  liveChat = new LiveChat({channelId: botConfig.channelId}, 5000)// interval is for live chat
  initLiveChatEvents()
  /*DONT AWAIT await*/ StartMainLoop()
  return {}
}

const stopLiveChat = async () => {
  if(!working){
    return {error:"Live chat bot is not working."}
  }
  StopMainLoop();
  liveChat.stop("Command");
  logger.log("Live chat bot stopped.")
  return {}
}

const getLiveChatMessage = async () => {
  return botConfig.messageText
}

const setLiveChatMessage = async (textMessage) => {
  botConfig.messageText = textMessage
  await db.setYoutubeBotConfig(botConfig)
}

const getLiveChatMode = async () => {
  return botConfig.mode
}

const setLiveChatMode = async (mode) => {
  let valid = Object.keys(MessagingMode).includes(mode);
  if(!valid){
    logger.error(`${mode} is not valid for live chat mode.`);
    return {error: `${mode} is not valid for live chat mode.`};
  }
  botConfig.mode = mode
  await db.setYoutubeBotConfig(botConfig)
  return {error: null}
}

const getLiveChatFreqCount = async () => {
  return botConfig.messageFreqCount
}

const setLiveChatFreqCount = async (count) => {
  if(count < 2){
    logger.error(`${count} should be above 1.`);
    return {error: `${count} should be above 1.`};
  }

  botConfig.messageFreqCount = count
  await db.setYoutubeBotConfig(botConfig);
  return {error: null}
}

const getLiveChatFreqSec = async () => {
  return botConfig.messageFreqSec
}

const setLiveChatFreqSec = async (freq) => {
  if(freq < 5){
    logger.error(`${freq} should be above 5.`);
    return {error: `${freq} should be above 5.`};
  }

  botConfig.messageFreqSec = freq
  await db.setYoutubeBotConfig(botConfig)
  return {}
}

const getLiveChatChannelId = async () => {
  return botConfig.channelId
}

const setLiveChatChannelId = async (channelId) => {
  if(botConfig.channelId == channelId){
    return {error:"ChannelId is already "+channelId}
  }

  if(!await youtubeService.validateChannelId(channelId)){
    return {error: `Channel id \"${channelId}\" could not found.`}
  }

  botConfig.channelId = channelId
  await db.setYoutubeBotConfig(botConfig)

  if(working){
    await stopLiveChat();
    await startLiveChat();
  }
}

const toggleLiveChat = async () =>{
  if(process.env.GOOGLE_CLIENT_ID == '' || process.env.GOOGLE_CLIENT_ID == null)
  {
    return {
      error: 'GOOGLE_CLIENT_ID env var is not defined!',
      working : false
    };
  }

  if(working){
    let result = {
      error: (await stopLiveChat()).error,
      working: working
    }
    if(!result.error){
      botConfig.enabled = false
      await db.setYoutubeBotConfig(botConfig)
    }
    return result;
  }else{
    let result = {
      error: (await startLiveChat()).error,
      working: working
    }
    if(!result.error){
      botConfig.enabled = true
      await db.setYoutubeBotConfig(botConfig)
    }
    return result;
  }
}

const sendLiveChatMessage = async (message) =>{
  if(currentLiveChatId == null){
    return {error: "There is no active stream right now."}
  }

  let response = await youtubeService.sendLiveChatMessage(currentLiveChatId, message)
  if(response != null && response.error != null){
    return {error: response.error}
  }
  return {error:null}
}

module.exports = { 
  toggleLiveChat,
  getLiveChatMessage, setLiveChatMessage,
  getLiveChatMode, setLiveChatMode,
  getLiveChatFreqCount, setLiveChatFreqCount,
  getLiveChatFreqSec, setLiveChatFreqSec,
  getLiveChatChannelId, setLiveChatChannelId,
  sendLiveChatMessage
};
