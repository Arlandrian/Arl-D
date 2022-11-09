const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const youtube = require("../../youtube")
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  let liveChatFreq = Number(args[0])
  await youtube.setLiveChatFreqSec(liveChatFreq);
  const reply = `Live chat bot message frequency is set to: ${liveChatFreq} seconds.`
  message.channel.send(reply);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["ytsetmessagefreq","ytsetmsgfreq"],
  permLevel: "Administrator"
};

exports.help = {
  name: "youtube set message frequency",
  category: "Youtube Bot",
  description: "Set the youtube live chat message frequency of bot in seconds.",
  usage: "ytsetmessagefreq 120"
};
