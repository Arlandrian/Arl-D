const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const youtube = require("../../youtube")
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  let liveChatMessage = args.join(' ')
  let result = await youtube.sendLiveChatMessage(liveChatMessage);
  if(result.error != null){
    message.reply(`Failed: ${result.error}`);
    return
  }

  const reply = `Your message is sent. "${liveChatMessage}"`
  message.reply(reply);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["ytsendmessage","ytsendmsg"],
  permLevel: "Administrator"
};

exports.help = {
  name: "youtube send live message",
  category: "Youtube Bot",
  description: "Sends an immidiate live chat message to the stream.",
  usage: "ytsendmessage 'your messsage'(without quotes))"
};
