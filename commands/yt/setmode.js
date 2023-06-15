const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const youtube = require("../../youtube")
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  let liveChatMode = args[0]
  let resp = await youtube.setLiveChatMode(liveChatMode);
  if(resp.error != null){
    message.reply(resp.error)
    return
  }

  const reply = `Live chat bot message mode is set to: ${liveChatMode}.`
  message.reply(reply);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["ytsetmode","ytsetmessagemode"],
  permLevel: "Bot Owner"
};

exports.help = {
  name: "youtube set message mode",
  category: "Youtube Bot",
  description: "Set the youtube live chat messaging mode. Valid Modes => MESSAGE_COUNTER, SECOND_BASED",
  usage: "ytsetmode SECOND_BASED"
};
