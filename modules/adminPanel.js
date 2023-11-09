exports.panel = async (client, interaction) => {
  if (!isBotOwner(interaction)) {
    interaction
      .reply({
        content: "Only bot owner has access to this command.",
        ephemeral: true,
      })
      .catch((e) =>
        console.error("admin panel:: An error occurred replying on an error", e)
      );
    return;
  }

  try {
    await handleInteractions(client, interaction);
  } catch (err) {
    interaction
      .reply({
        content: `Error occured: ${JSON.stringify(err)}`,
        ephemeral: true,
      })
      .catch((e) =>
        console.error("admin panel:: An error occurred replying on an error", e)
      );
  }
};

const handleInteractions = async (client, interaction) => {
  const guilds = client.guilds.cache.array();
  const itemsPerPage = 5;

  const page = interaction.customId.startsWith("left")
    ? Math.max(0, parseInt(interaction.values[0], 10) - 1)
    : interaction.customId.startsWith("right")
    ? Math.min(
        Math.ceil(guilds.length / itemsPerPage) - 1,
        parseInt(interaction.values[0], 10) + 1
      )
    : 0;

  const startIdx = page * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const visibleGuilds = guilds.slice(startIdx, endIdx);

  const options = visibleGuilds.map((guild) => ({
    label: `${guild.name} (${guild.memberCount} members, ${guild.channels.cache.size} channels) - Owner: ${guild.owner.user.tag} (${guild.ownerID})`,
    value: guild.id,
  }));
  const row = {
    type: "ACTION_ROW",
    components: [
      {
        type: "SELECT_MENU",
        customId: "guilds",
        placeholder: "Select a guild",
        options,
      },
    ],
  };

  if (page > 0) {
    row.components.push({
      type: "BUTTON",
      label: "◀️",
      customId: `left-${page}`,
      style: "PRIMARY",
    });
  }

  if (page < Math.ceil(guilds.length / itemsPerPage) - 1) {
    row.components.push({
      type: "BUTTON",
      label: "▶️",
      customId: `right-${page}`,
      style: "PRIMARY",
    });
  }
  await interaction.update({
    components: [row],
  });
};

const isBotOwner = (message) => {
  const user = message.author ?? message.user;
  return user.id === process.env.OWNER;
};
