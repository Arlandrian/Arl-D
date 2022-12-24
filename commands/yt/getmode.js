const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const youtube = require("../../youtube")
const durationFormatter = new DurationFormatter();

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  let mode = await youtube.getLiveChatMode();
  const reply = `Live chat bot messaging mode: ${mode}`
  message.reply(reply);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["yt getmode","ytgetmode","ytgetmessagingmode","ytgetmessagemode"],
  permLevel: "Administrator"
};

exports.help = {
  name: "youtube get mode",
  category: "Youtube Bot",
  description: "Get the youtube live chat message mode.",
  usage: "ytgetmessagemode, ytgetmode"
};
