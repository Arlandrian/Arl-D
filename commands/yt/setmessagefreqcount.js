const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const youtube = require("../../youtube")
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  let liveChatFreqCount = Number(args[0])
  // Check if valid arg
  if(liveChatFreqCount == NaN || liveChatFreqCount == null){
    message.reply("invalid input");
    return
  }
  
  let resp = await youtube.setLiveChatFreqCount(liveChatFreqCount);
  if(resp.error != null){
    message.reply(resp.error)
    return
  }

  const reply = `Live chat bot message frequency is set to: ${liveChatFreqCount} seconds.`
  message.reply(reply);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["ytsetmessagefreqcount","ytsetmsgfreqcount"],
  permLevel: "Administrator"
};

exports.help = {
  name: "youtube set message frequency count",
  category: "Youtube Bot",
  description: "Set the youtube live chat message frequency count for count based mode. (Sends message every x message.)",
  usage: "ytsetmsgfreqcount 60"
};
