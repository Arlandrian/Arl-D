const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const youtube = require("../../youtube")
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  let liveChatMessage = args.join(' ')
  await youtube.setLiveChatMessage(liveChatMessage);
  const reply = `Live chat bot message is set to: ${liveChatMessage}`
  message.channel.send(reply);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["ytsetmessage","ytsetmsg"],
  permLevel: "Administrator"
};

exports.help = {
  name: "youtube set message",
  category: "Youtube Bot",
  description: "Set the youtube live chat message of bot.",
  usage: "ytsetmessage 'new bot messsage'(without quotes))"
};
