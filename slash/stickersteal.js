const discord = require("discord.js");
// const logger = require("../modules/logger");

exports.run = async (client, interaction) => {
  await interaction.deferReply({ ephemeral: false });
  let message = interaction.targetMessage;
  const stickers = message.stickers;
  const sticker = stickers.first();
  if (sticker == null) {
    interaction.editReply({
      content: "No stickers found in the message.",
      ephemeral: true,
    });
    return;
  }

  const fetchedSticker = await sticker.fetch();
  // fetch only retrieves tags... :sadge:
  let urlExt = "";
  if (fetchedSticker.format == "PNG") {
    urlExt = "png";
  } else if (fetchedSticker.format == "APNG") {
    urlExt = "png";
  } else {
    interaction.editReply({
      content: "Unsupported sticker format: " + fetchedSticker.format,
      ephemeral: true,
    });
    return;
  }
  const stickerURL = `https://cdn.discordapp.com/stickers/${fetchedSticker.id}.${urlExt}`;
  interaction.guild.stickers
    .create(stickerURL, fetchedSticker.name, fetchedSticker.tags.first())
    .then((sticker) => {
      console.log(`**${sticker.name}** added successfully!`);
      interaction.editReply({
        content: `Successfully added **${sticker.name}**`,
        ephemeral: true,
      });
    })
    .catch((error) => {
      console.error(`Error adding sticker to the guild: ${error}`);
      interaction.editReply({
        content: `Unable to add **${sticker.name}**! error: ${error}`,
        ephemeral: true,
      });
    });
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
