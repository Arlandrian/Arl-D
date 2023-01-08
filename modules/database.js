const { createClient } = require('redis');
let client = null
async function initdb(){
  if(process.env.REDIS_URL == null){
    console.warn("REDIS_URL env var is not defined, some features will not work!")
    return
  }

  //'redis://alice:foobared@awesome.redis.server:6380'
  client = createClient({
    url: `redis://${process.env.REDIS_USER}:${process.env.REDIS_PWD}@${process.env.REDIS_URL}`,
  });
  client.on('error', (err) => console.log('Redis Client Error', err));
  client.on('connection', (me) => console.log('Redis connected successfully.'));
  await client.connect();
}

const NICK_LOG_KEY = "arld:guild:nickLogChannels"
const CONFESSION_KEY = "arld:guild:confessionChannels"
const LOG_IGNORE_KEY = "arld:guild:logIgnoreChannels"
const YOUTUBE_BOT_CONFIG_KEY = "arld:youtubeBotConfig"

async function setGuildChannelsBase(channelKey, guildId, channels) {
  await client.hSet(channelKey, guildId, JSON.stringify(channels))
}

async function getGuildChannelsBase(channelKey, guildId){
  let val = await client.hGet(channelKey, guildId)
  if(val == null){
    val = []
    await setGuildChannelsBase(channelKey, guildId, val)
    return val
  }
  return JSON.parse(val)
}

async function getAllGuildChannelsBase(channelKey){
  let data = await client.hGetAll(channelKey)
  return Object.keys(data).map(key => ({ key, value: JSON.parse(data[key]) }))
}

async function setNickLogChannels(guildId, channels) {
  await setGuildChannelsBase(NICK_LOG_KEY, guildId, channels)
}

async function getNickLogChannels(guildId) {
  return await getGuildChannelsBase(NICK_LOG_KEY, guildId)
}

async function getAllNickLogChannels(){
  return await getAllGuildChannelsBase(NICK_LOG_KEY)
}

async function setConfessionChannels(guildId, channels) {
  await setGuildChannelsBase(CONFESSION_KEY, guildId, channels)
}

async function getConfessionChannels(guildId) {
  return await getGuildChannelsBase(CONFESSION_KEY, guildId)
}

async function getAllConfessionChannels(){
  return await getAllGuildChannelsBase(CONFESSION_KEY)
}

async function setLogIgnoreChannels(guildId, channels) {
  await setGuildChannelsBase(LOG_IGNORE_KEY, guildId, channels)
}

async function getLogIgnoreChannels(guildId) {
  return await getGuildChannelsBase(LOG_IGNORE_KEY, guildId)
}

async function getAllLogIgnoreChannels(){
  return await getAllGuildChannelsBase(LOG_IGNORE_KEY)
}

async function getYoutubeBotConfig() {
  return JSON.parse(await client.get(YOUTUBE_BOT_CONFIG_KEY))
}
async function setYoutubeBotConfig(config) {
  await client.set(YOUTUBE_BOT_CONFIG_KEY, JSON.stringify(config))
}


// Base Helper
async function saveGuildObject(guildId, key, value){
  await client.hSet(key, guildId, JSON.stringify(value))
}

async function loadGuildObject(guildId, key){
  let val = await client.hGet(key, guildId)
  if(val == null){
    val = {}
    await saveGuildObject(key, guildId, val)
    return val
  }
  return JSON.parse(val)
}

module.exports = { 
  initdb,
  setNickLogChannels, getNickLogChannels, getAllNickLogChannels,
  setConfessionChannels, getConfessionChannels, getAllConfessionChannels,
  setLogIgnoreChannels, getLogIgnoreChannels, getAllLogIgnoreChannels,
  getYoutubeBotConfig, setYoutubeBotConfig
}