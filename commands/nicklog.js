const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const { container, db } = client;
  // check if a watch exists

  let channels =  await db.getNickLogChannels(message.guild.id)

  let targettedChannelId = message.channel.id
  if(channels.includes(targettedChannelId)){
    let newChannelList = removeItemOnce(channels, targettedChannelId)
    await db.setNickLogChannels(message.guild.id, newChannelList)

    const reply = codeBlock("asciidoc", `👀 Stopping watching users on this channel 👀`);
    message.channel.send(reply);
    return;
  }
  channels.push(targettedChannelId)
  await db.setNickLogChannels(message.guild.id, channels)
  const reply = codeBlock("asciidoc", `👀 Started watching users 👀`);
  message.channel.send(reply);
};


function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "Administrator"
};

exports.help = {
  name: "nicklog",
  category: "Miscellaneous",
  description: "Logs nick and username changes to current channel. To disable it run it again on the same chanel.",
  usage: "nicklog"
};
