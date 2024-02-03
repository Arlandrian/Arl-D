const discord = require("discord.js");
// const logger = require("../modules/logger");

exports.run = async (client, interaction) => {
  await interaction.deferReply({ ephemeral: false });
  let message = interaction.targetMessage;
  const stickers = message.stickers;
  console.log("Stickers:"+JSON.stringify(stickers))
  const firstSticker = stickers.first();
  
  if (firstSticker) {
    console.log(firstSticker)
    const namee = firstSticker.name;
    message.guild.stickers.create(firstSticker.url, firstSticker.name, firstSticker.tags)
      .then(sticker => interaction.channel.send(`**${namee}** added successfully!`))
      .catch(error => {
        console.error(`Error adding sticker to the guild: ${error}`)
        interaction.channel.send(`cant add **${namee}**! error: ${error}`)
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
