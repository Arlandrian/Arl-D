const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const youtube = require("../../youtube")
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  let liveChatMessage = youtube.getLiveChatMessage();
  const reply = `Live chat bot message: ${liveChatMessage}`
  message.channel.send(reply);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["yt getmessage","ytgetmessage","ytgetmsg"],
  permLevel: "Administrator"
};

exports.help = {
  name: "youtube get message",
  category: "Youtube Bot",
  description: "Get the youtube live chat message of bot.",
  usage: "yt getmessage"
};
