const discord = require("discord.js");
exports.run = async (client, interaction) => {
  // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: false });
  let content = "";
  const guilds = await client.guilds.fetch();
  guilds.forEach(async (guild) => {
    const owner = await guild.fetchOwner();
    const ownerUser = JSON.stringify(owner.user);
    content += `\n# ${guild.name}'${guild.id}'\nmembers:${guild.memberCount}, channels: ${guild.channels.cache.size} - Owner: ${ownerUser} (${owner.id})\n`;
    content += "## Channels\n";
    const channels = await guild.channels.fetch();
    channels.forEach((ch) => {
      content += `  ${ch.name}${ch.isThread() ? " (Thread)" : ""}\n`;
    });
    content += "## Roles\n";
    const roles = await guild.roles.fetch();
    roles.forEach((role) => {
      content += `  ${role.name}\n`;
    });
    content += "\n---\n";
  });

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
