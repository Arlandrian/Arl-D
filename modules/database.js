const { createClient } = require('redis');
let client = null
async function initdb(){
  //'redis://alice:foobared@awesome.redis.server:6380'
  client = createClient({
    url: `redis://${process.env.REDIS_USER}:${process.env.REDIS_PWD}@${process.env.REDIS_URL}`,
  });
  client.on('error', (err) => console.log('Redis Client Error', err));
  client.on('connection', (me) => console.log('Redis connected successfully.'));
  
  await client.connect();
}

const NICK_LOG_KEY = "arld:guild:nickLogChannels"
const YOUTUBE_BOT_CONFIG_KEY = "arld:youtubeBotConfig"

async function setNickLogChannels(guildId, channels) {
  await client.hSet(NICK_LOG_KEY, guildId, JSON.stringify(channels))
}

async function getNickLogChannels(guildId) {
  let val = await client.hGet(NICK_LOG_KEY, guildId)
  if(val == null){
    await setNickLogChannels(guildId, [])
    return []
  }
  return JSON.parse(await client.hGet(NICK_LOG_KEY, guildId))
}

async function getAllNickLogChannels(){
  let data = await client.hGetAll(NICK_LOG_KEY)
  return Object.keys(data).map(key => ({ key, value: JSON.parse(data[key]) }))
}

async function getYoutubeBotConfig() {
  return JSON.parse(await client.get(YOUTUBE_BOT_CONFIG_KEY))
}
async function setYoutubeBotConfig(config) {
  await client.set(YOUTUBE_BOT_CONFIG_KEY, JSON.stringify(config))
}

module.exports = { 
  initdb,
  setNickLogChannels, getNickLogChannels, getAllNickLogChannels,
  getYoutubeBotConfig, setYoutubeBotConfig
}