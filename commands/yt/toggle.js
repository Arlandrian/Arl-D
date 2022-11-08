const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const youtube = require("../../youtube")
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const resp = await youtube.toggleLiveChat();
  if(resp.error != undefined){
    const reply = `Live chat bot toggle failed. Error: ${resp.error}`
    message.channel.send(reply);
    return;
  }
  const reply = `Live chat bot is __**${resp.working?'activated':'deactivated'}**__.`
  message.channel.send(reply);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["yt toggle","yttoggle"],
  permLevel: "Administrator"
};

exports.help = {
  name: "youtube bot toggle",
  category: "Youtube Bot",
  description: "Toggle the youtube bot on/off.",
  usage: "yt toggle"
};
