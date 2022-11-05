const logger = require("../modules/logger.js");
const {sendAMessageToNickLogChannels} = require("../modules/functions");

module.exports = async (client, oldUser, newUser) => {
  // check if nickname changed
  if(oldUser.username == newUser.username){
    return
  }
  const {db} = client
  let message = `<@${newUser.id}> id:"__**${newUser.id}**__" changed their username from __**${oldUser.username}**__ to __**${newUser.username}**__`

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