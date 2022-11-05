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


const nickLogHKey = "arld:guild:nickLogChannels"

async function setNickLogChannels(guildId, channels) {
  await client.hSet(nickLogHKey, guildId, JSON.stringify(channels))
}

async function getNickLogChannels(guildId) {
  let val = await client.hGet(nickLogHKey, guildId)
  if(val == null){
    await setNickLogChannels(guildId, [])
    return []
  }
  return JSON.parse(await client.hGet(nickLogHKey, guildId))
}

async function getAllNickLogChannels(){
  let data = await client.hGetAll(nickLogHKey)
  return Object.keys(data).map(key => ({ key, value: JSON.parse(data[key]) }))
}


module.exports = { initdb , setNickLogChannels, getNickLogChannels, getAllNickLogChannels }