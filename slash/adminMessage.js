const discord = require("discord.js");
const logger = require("../modules/logger")
exports.run = async (client, interaction) => { 
  await interaction.deferReply({ ephemeral: true });
  let opts = interaction.options._hoistedOptions;
  if(opts[0].value == null){
    await interaction.editReply("Please enter a message")
    return;
  }
  let msg = opts[0].value
  // Create embed message
  let embedMessage = new discord.MessageEmbed()
    .setDescription(msg)
    .setColor("#e9be11")
  interaction.channel.send({embeds:[embedMessage]})
  logger.log(`Admin:${interaction.user.tag} | Message:${msg}`)
  await interaction.editReply("Admin message is sent.")
};

exports.commandData = {
  name: "admin_message",
  description: "Sends an admin message.",
  descriptionLocalizations:  {},
  options: [
    {
      "name": "message",
      "description": "Message",
      "type": 3,
      "required": true
    }
  ],
  defaultMemberPermissions: discord.Permissions.FLAGS.BAN_MEMBERS,
  dmPermission: false,
  type: 1
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "Bot Owner",
  guildOnly: true
};