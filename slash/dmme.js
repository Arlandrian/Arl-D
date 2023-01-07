const discord = require("discord.js");
const logger = require("../modules/logger")
exports.run = async (client, interaction) => { // eslint-disable-line no-unused-vars
  //await interaction.deferReply({ephemeral: true});
  await interaction.deferReply({ ephemeral: true });

  let requester = interaction.user
  let message = interaction.targetMessage;

  let attachments = message.attachments != null ?  Array.from(message.attachments.map(x=>x.proxyURL)).join("\n"): null;
  let files = message.files != null ?  Array.from(message.files.map(x=>x.proxyURL)).join("\n") : null;
  let content = `Sent by: ${message.author}.\n${message.content}`

  if(files != null){
    content += "\n"+files
  }
  if(attachments != null){
    content += "\n"+attachments
  }

  await requester.dmChannel.send(
    {
      content: content,
      embeds: message.embeds != null ? Array.from(message.embeds?.values()) : null,
      // attachments: message.attachments != null ? Array.from(message.attachments?.values()) : null,
      // files: message.files != null ? Array.from(message.files?.values()) : null
    });

  await interaction.editReply("DM sent.");
};

exports.commandData = {
  name: "DM This To Me",
  //description: "Shows nick history of the user. Uses nicklog channel as a database.",
  options: [],
  defaultPermission: true,
  type: 3//ApplicationCommandTypes.USER
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "User",
  guildOnly: true
};