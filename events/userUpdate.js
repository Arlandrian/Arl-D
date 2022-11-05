const logger = require("../modules/logger.js");
const {sendAMessageToNickLogChannels} = require("../modules/functions");

module.exports = async (client, oldUser, newUser) => {
  // check if nickname changed
  if(oldUser.username == newUser.username){
    return
  }
  const {db} = client
  let message = `<@${newUser.id}> id:"${newUser.id}" changed their username from ${oldUser.username} to ${newUser.username}`

  let guildsMap = await db.getAllNickLogChannels()
  let promises = []
  for (const {key, value} of guildsMap) {
    let guildId = key
    let channels = value
    let guild = client.guilds.cache.get(guildId)
    if (guild != null && guild.members.cache.get(newUser.id)) {
      // there is a GuildMember with that ID
      promises.push(sendAMessageToNickLogChannels(client, guildId, message, channels))
    }
  }
  await Promise.all(promises)
  // get all guilds from settings
  // check if user exists on that guild
  //  if so send the notif to the registered channels 
};

/*
user examples
{
  id: "996904431096451143",
  bot: false,
  system: false,
  flags: {
    bitfield: 0,
  },
  username: "devvvrim",
  discriminator: "5078",
  avatar: "8767d39291d2002d8bc4326d42bdb360",
},
{
  id: "996904431096451143",
  bot: false,
  system: false,
  flags: {
    bitfield: 0,
  },
  username: "devrim",
  discriminator: "5078",
  avatar: "8767d39291d2002d8bc4326d42bdb360",
}
*/