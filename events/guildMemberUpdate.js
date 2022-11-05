const logger = require("../modules/logger.js");
const {sendAMessageToNickLogChannels} = require("../modules/functions")

module.exports = (client, oldMember, newMember) => {
  // check if nickname changed
  if(oldMember.nickname == newMember.nickname){
    return
  }

  let optional = oldMember.nickname != null ? `The old nickname was __**${oldMember.nickname}**__.`:'';
  let message = `<@${oldMember.user.id}> id:"__**${oldMember.user.id}**__" changed their nickname to __**${newMember.nickname}**__. ${optional}`
  // send message to channels
  sendAMessageToNickLogChannels(client, oldMember.guild.id, message)
};
