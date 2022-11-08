const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const youtube = require("../../youtube")
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  let getLiveChatChannelId = youtube.getLiveChatChannelId();
  const reply = `Live chat bot channel id: ${getLiveChatChannelId}`
  message.channel.send(reply);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["yt getchannelid","ytgetchannelid","ytch"],
  permLevel: "Administrator"
};

exports.help = {
  name: "youtube get channelid",
  category: "Youtube Bot",
  description: "Get the youtube live chat bot active channel id.",
  usage: "yt getchannelid"
};
