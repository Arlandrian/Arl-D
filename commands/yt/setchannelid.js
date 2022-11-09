const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const youtube = require("../../youtube")
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  let liveChatChannelId = args[0]
  let resp = await youtube.setLiveChatChannelId(liveChatChannelId);
  if(resp != undefined && resp.error != undefined){
    const reply = `Failed! Error: ${resp.error}`
    message.channel.send(reply);
    return;
  }

  const reply = `Live chat bot channel id is set to: __${liveChatChannelId}__`
  message.channel.send(reply);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["ytsetchannelid","ytsetchid"],
  permLevel: "Administrator"
};

exports.help = {
  name: "youtube set channel id",
  category: "Youtube Bot",
  description: "Set the youtube live chat bot active channel id.",
  usage: "ytsetchannelid 'channelid' (without quotes)"
};
