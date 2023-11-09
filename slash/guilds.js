const discord = require("discord.js");
exports.run = async (client, interaction) => {
  // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: false });
  const guilds = client.guilds.cache.array();
  let content = "";
  for (const guild in guilds) {
    content += `\n# ${guild.name}'${guild.id}'\nmembers:${guild.memberCount}, channels: ${guild.channels.cache.size} - Owner: ${guild.owner.user.tag} (${guild.ownerID})\n`;
    content += "## Channels\n";
    for (const ch in guild.channels.cache.array()) {
      content += `  ${ch.name}${ch.isThread() ? " (Thread)" : ""}\n`;
    }
    content += "## Roles\n";
    for (const role in guild.roles.cache.array()) {
      content += `  ${role.name}\n`;
    }
    content += "\n---\n";
  }
  const atc = new discord.MessageAttachment(
    Buffer.from(content),
    "guilds_export.md"
  );
  interaction.editReply({ files: [atc] });
};

exports.commandData = {
  name: "guilds",
  description: "Exports information about the guilds that using this bot.",
  options: [],
  defaultPermission: true,
  type: 1, //ApplicationCommandTypes.USER
};

exports.conf = {
  permLevel: "Bot Owner",
  guildOnly: false,
};
