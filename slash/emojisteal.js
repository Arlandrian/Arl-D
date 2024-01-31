const discord = require("discord.js");
// const logger = require("../modules/logger");

exports.run = async (client, interaction) => {
  await interaction.deferReply({ ephemeral: false });
  let message = interaction.targetMessage.content;

  // extract emojis
  let emojis = extractEmojis(message);
  if (emojis.length == 0) {
    interaction.reply({
      content: "No emoji found in the message.",
      ephemeral: true,
    });
    return;
  }

  // add emojis to the server
  for (const emoji of emojis) {
    interaction.guild.emojis
      .create(emoji)
      .then((em) =>
        interaction.channel.send(`**${emoji.name}** added successfully!`)
      );
  }

  interaction.reply({
    content: `${emojis.length} emojis added.`,
    ephemeral: true,
  });
};

const emojiRegex = /<a?:.+?:\d{16,20}>/gu;
const emojiPartRegex = /^<([^:]*):([^:]+):([^>]+)>$/

const url = "https://cdn.discordapp.com/emojis/";

function extractEmojis(message) {
  let results = [];
  let matches = message.match(emojiRegex);
  if (matches == null || matches.length == 0) {
    return results;
  }

  for (const match of matches) {
    //<a:pepeD:816110289409409034> for gifs
    // OR
    //<:bc:1013596306360508506> for images
    var parts = match.match(emojiPartRegex);
    var exts = parts[1].includes("a") ? "gif" : "png";
    var name = parts[2];
    var id = parts[3];
    results.push({
      attachment: `${url}${id}.${exts}`,
      name: name,
    });
  }
  return results;
}

exports.commandData = {
  name: "Emoji Steal",
  options: [],
  defaultPermission: true,
  defaultMemberPermissions: discord.Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS,
  type: 3, //ApplicationCommandTypes.USER
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "User",
  guildOnly: true,
};

// const testText = "//<a:pepeD:816110289409409034> for gifs OR<:bc:1013596306360508506> for images"
// console.log(extractEmojis(testText));