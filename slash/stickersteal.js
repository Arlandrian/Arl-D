const discord = require("discord.js");
// const logger = require("../modules/logger");

exports.run = async (client, interaction) => {
  await interaction.deferReply({ ephemeral: false });
  let message = interaction.targetMessage;
  const stickers = message.stickers;
  const sticker = stickers.first();
  if (sticker) {
    sticker
      .fetch()
      .then((fetchedSticker) => {
        // fetch only retrieves tags... :sadge:
        let urlExt = ""
        if (fetchedSticker.format == "PNG") {
          urlExt = "png";
        } else if (fetchedSticker.format == "APNG") {
          urlExt = "png";
        }else {
          throw new Error("Unsupported sticker format: " + fetchedSticker.format);
        }
        const stickerURL = `https://cdn.discordapp.com/stickers/${fetchedSticker.id}.${urlExt}`;
        message.guild.stickers
          .create(stickerURL, fetchedSticker.name, fetchedSticker.tags.first())
          .then((sticker) =>
            interaction.channel.send(
              `**${sticker.name}** added successfully!`
            )
          )
          .catch((error) => {
            console.error(`Error adding sticker to the guild: ${error}`);
            interaction.channel.send(
              `cant add **${sticker.name}**! error: ${error}`
            );
          });
      })
      .catch((error) => {
        console.error(`Error fetching sticker: ${error}`);
        interaction.channel.send(
          `cant add **${sticker.name}**! error: ${error}`
        );
      });
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
