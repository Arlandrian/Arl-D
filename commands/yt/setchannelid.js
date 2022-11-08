const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const youtube = require("../../youtube")
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  let liveChatChannelId = getOptionalArgs(args)
  let resp = await youtube.setLiveChatChannelId(liveChatChannelId);
  if(resp.error != undefined){
    const reply = `Failed! Error: ${resp.error}`
    message.channel.send(reply);
    return;
  }

  const reply = `Live chat bot channel id is set to: __${liveChatChannelId}__`
  message.channel.send(reply);
};

const getOptionalArgs = (args) => {
  let arg = null
  if(args.length == 1){
    arg = args[0];
  }else if(args.length == 2){
    arg = args[1];
  }
  return arg
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["yt setmessage","ytsetmessage","ytsetmsg"],
  permLevel: "Administrator"
};

exports.help = {
  name: "youtube set message",
  category: "Youtube Bot",
  description: "Set the youtube live chat bot active channel id.",
  usage: "yt setchannelid"
};
