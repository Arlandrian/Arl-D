const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const youtube = require("../../youtube")
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  let liveChatFreq = await youtube.getLiveChatFreqCount();
  const reply = `Live chat bot message freq: ${liveChatFreq}`
  message.reply(reply);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["yt getmessagefreqcount","ytgetmessagefreqcount","ytgetmsgfreqcount","ytgetmsgfrqcount"],
  permLevel: "Administrator"
};

exports.help = {
  name: "youtube get message frequency count",
  category: "Youtube Bot",
  description: "Get the youtube live chat message frequency count.",
  usage: "ytgetmessagefreq"
};
