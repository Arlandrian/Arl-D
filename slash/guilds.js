const discord = require("discord.js");
exports.run = async (client, interaction) => {
  // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: false });

  switch (interaction.options.getSubcommand()) {
    case "getall":
      await getAllHandler(client, interaction);
      break;
    case "readchannel":
      await readChannelHandler(client, interaction);
      break;
    case "writechannel":
      await writeChannelHandler(client, interaction);
      break;
    case "listenchannel":
      await listenChannelHandler(client, interaction);
      break;
  }
};

exports.commandData = {
  name: "guilds",
  description: "Exports information about the guilds that using this bot.",
  defaultPermission: true,
  type: 1, //ApplicationCommandTypes.USER
  options: [
    {
      name: "getall",
      description: "Exports information about the guilds that using this bot.",
      type: "SUB_COMMAND",
      options: [],
    },
    {
      name: "readchannel",
      description: "read messages in a guild channel",
      descriptionLocalizations: {
        tr: "Bir sunucudaki mesajları oku.",
      },
      type: "SUB_COMMAND",
      options: [
        ...requiredSubCommandOptions,
        {
          name: "count",
          description: "Number of message to read",
          descriptionLocalizations: {
            tr: "Okunacak mesaj sayısı",
          },
          type: 4,
          required: false,
          min_value: 0,
          max_value: 1000,
        },
      ],
    },
    {
      name: "writechannel",
      description: "listen messages in a guild channel",
      descriptionLocalizations: {
        tr: "Bir sunucudaki mesajları dinler.",
      },
      type: "SUB_COMMAND",
      options: [
        ...requiredSubCommandOptions,
        {
          name: "message",
          description: "content of the message",
          descriptionLocalizations: {
            tr: "Mesaj içeriği.",
          },
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "listenchannel",
      description: "listen messages in a guild channel",
      descriptionLocalizations: {
        tr: "Bir sunucudaki mesajları dinler.",
      },
      type: "SUB_COMMAND",
      options: [...requiredSubCommandOptions],
    },
  ],
};

const requiredSubCommandOptions = [
  {
    name: "guildid",
    description: "Id of guild.",
    descriptionLocalizations: {
      tr: "Server id",
    },
    type: 3,
    required: true,
  },
  {
    name: "channelid",
    description: "Id of channel",
    descriptionLocalizations: {
      tr: "id channel",
    },
    type: 3,
    required: true,
  },
];

async function getAllHandler(client, interaction) {
  let content = "# GUILDS";
  await client.guilds.fetch();
  content += client.guilds.cache.size + "\n";
  for (const guild of client.guilds.cache.values()) {
    const owner = (await guild.fetchOwner()).user;
    const displayAvatar = owner.displayAvatarURL();
    content += `\n# ${guild.name}'${guild.id}'\nmembers:${guild.memberCount}, channels: ${guild.channels.cache.size} - Owner: \n\n\n${owner.username} -${owner.id}- ![](${displayAvatar})\n`;
    content += "## Channels\n";
    await guild.channels.fetch();
    for (const ch of guild.channels.cache.values()) {
      content += `  ${ch.name}${ch.isThread() ? " (Thread)" : ""} - ${ch.id}\n`;
    }

    content += "## Roles\n";
    await guild.roles.fetch();
    for (const role of guild.roles.cache.values()) {
      content += `  ${role.name} - ${role.id}\n`;
    }
    content += "\n---\n";
  }

  const atc = new discord.MessageAttachment(
    Buffer.from(content),
    "guilds_export.md"
  );
  interaction.editReply({ files: [atc] });
}

function readChannelHandler(client, interaction) {
  const opts = interaction.options._hoistedOptions;
  const guildId = opts[0].value;
  const channelId = opts[1].value;
  const messageCount = getOption(opts, "count", "100");
  interaction.editReply("not implemented");
}

function writeChannelHandler(client, interaction) {
  const opts = interaction.options._hoistedOptions;
  const guildId = opts[0].value;
  const channelId = opts[1].value;
  const messageContent = opts[2].value;
}

function listenChannelHandler(client, interaction) {
  const opts = interaction.options._hoistedOptions;
  const guildId = opts[0].value;
  const channelId = opts[1].value;
  client.on("messageCreate", (message) => {
    // you dont need to listen messages for the same channel, you are already see the messages on that channel
    if (isSameChannel(message, interaction)) {
      return;
    }
    if (guildId == "all") {
      if (channelId == "all") {
        interaction.channel.send(message);
      } else if (channelId == message.channel.id) {
        interaction.channel.send(message);
      }
      return;
    }
    if (message.guildId == guildId) {
      if (channelId == "all") {
        interaction.channel.send(message);
      } else if (channelId == message.channel.id) {
        interaction.channel.send(message);
      }
      return;
    }
  });
  interaction.editReply("started listening channel - please dont abuse this");
}

function isSameChannel(message, interaction) {
  return message.channel.id == interaction.channel.id;
}

function getOption(opts, name, defValue) {
  const provided = opts.find((x) => x.name == name);
  if (provided == null) {
    return defValue;
  } else {
    return provided.value;
  }
}

exports.conf = {
  permLevel: "Bot Owner",
  guildOnly: false,
};
