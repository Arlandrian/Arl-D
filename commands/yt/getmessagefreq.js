const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const youtube = require("../../youtube")
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  let liveChatFreq = youtube.getLiveChatFreqSec();
  const reply = `Live chat bot message freq: ${liveChatFreq}`
  message.channel.send(reply);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["yt getmessagefreq","ytgetmessagefreq","ytgetmsgfreq"],
  permLevel: "Administrator"
};

exports.help = {
  name: "youtube get message frequency",
  category: "Youtube Bot",
  description: "Get the youtube live chat message frequency of bot in seconds.",
  usage: "yt getmessagefreq"
};
