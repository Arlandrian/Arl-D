const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const youtube = require("../../youtube")
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { 
  let liveChatFreq = Number(args[0])
  // Check if valid arg
  if(isNaN(liveChatFreq) || liveChatFreq == null){
    message.reply("invalid input");
    return
  }

  let resp = await youtube.setLiveChatFreqSec(liveChatFreq);
  if(resp.error != null){
    message.reply(resp.error)
    return
  }
  const reply = `Live chat bot message frequency is set to: ${liveChatFreq} seconds.`
  message.reply(reply);
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
