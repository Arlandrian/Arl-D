const discord = require("discord.js");
// const logger = require("../modules/logger");

exports.run = async (client, interaction) => {
  await interaction.deferReply({ ephemeral: false });
  let message = interaction.targetMessage;
  const stickers = message.stickers;
  const firstSticker = stickers.first();

  if (firstSticker) {
    message.guild.stickers.create(firstSticker.url, firstSticker.name)
      .then(sticker => interaction.channel.send(`**${firstSticker.name}** added successfully!`))
      .catch(error => console.error(`Error adding sticker to the guild: ${error}`));
  } else {
    interaction.editReply({
      content: "No stickers found in the message.",
      ephemeral: true,
    });
  }
};


exports.commandData = {
  name: "Sticker Steal",
  options: [],
  defaultPermission: true,
  defaultMemberPermissions:
    discord.Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS,
  type: 3, //ApplicationCommandTypes.USER
};


exports.conf = {
  permLevel: "User",
  guildOnly: true,
};
