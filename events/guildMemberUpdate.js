const logger = require("../modules/logger.js");
const {sendAMessageToNickLogChannels} = require("../modules/functions")

module.exports = (client, oldMember, newMember) => {
  // check if nickname changed
  if(oldMember.nickname == newMember.nickname){
    return
  }

  let optional = oldMember.nickname != null ? `The old nickname was ${oldMember.nickname}.`:'';
  let message = `<@${oldMember.user.id}> id:"${oldMember.user.id}" changed their nickname to ${newMember.nickname}. ${optional}`
  // send message to channels
  sendAMessageToNickLogChannels(client, oldMember.guild.id, message)
};
