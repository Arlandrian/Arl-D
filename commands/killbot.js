exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  await message.reply("Goodbye :smiling_face_with_tear:")
  process.exit(0);
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["killbot"],
  permLevel: "Bot Owner"
};

exports.help = {
  name: "killbot",
  category: "System",
  description: "This will kill the deployed app. Becareful!!!",
  usage: "killbot"
};
