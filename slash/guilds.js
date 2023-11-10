const discord = require("discord.js");

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

exports.run = async (client, interaction) => {
  // eslint-disable-line no-unused-vars

  switch (interaction.options.getSubcommand()) {
    case "getall":
      await interaction.deferReply({ ephemeral: false });
      await getAllHandler(client, interaction);
      break;
    case "readchannel":
      await interaction.deferReply({ ephemeral: false });
      await readChannelHandler(client, interaction);
      break;
    case "writechannel":
      await interaction.deferReply({ ephemeral: true });
      await writeChannelHandler(client, interaction);
      break;
    case "listenchannel":
      await interaction.deferReply({ ephemeral: true });
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

async function getAllHandler(client, interaction) {
  let content = "# GUILDS";
  await client.guilds.fetch();
  content += " using " + client.guilds.cache.size + " guilds...\n";
  for (const guild of client.guilds.cache.values()) {
    const owner = (await guild.fetchOwner()).user;
    const displayAvatar = owner.displayAvatarURL();
    content += `\n# ${guild.name}'${guild.id}'\nmembers:${guild.memberCount}, channels: ${guild.channels.cache.size} - Owner: \n\n${owner.username} -${owner.id}- \n![](${displayAvatar})\n`;
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

async function readChannelHandler(client, interaction) {
  const opts = interaction.options._hoistedOptions;
  const guildId = opts[0].value;
  const channelId = opts[1].value;
  const messageCount = getOption(opts, "count", 100);
  const guild = client.guilds.cache.get(guildId);
  if (guild == null) {
    interaction.editReply("Unknown guild id.");
    return;
  }
  let channel = guild.channels.cache.get(channelId);
  channel = channel ?? (await guild.channels.fetch(channelId));
  if (channel == null) {
    interaction.editReply("Unknown channel id.");
    return;
  }

  // Fetch messages in chunks of 100
  let fetchedMessages = [];
  let lastMessageId = null;

  while (fetchedMessages.length < messageCount) {
    // Fetch messages from the channel, starting from the last message ID
    const messages = await channel.messages.fetch({
      limit: Math.min(100, messageCount - fetchedMessages.length),
      before: lastMessageId,
    });

    // If no more messages are available, break the loop
    if (messages.size === 0) {
      break;
    }

    // Update the last message ID for the next iteration
    lastMessageId = messages.last().id;

    // Concatenate the fetched messages
    fetchedMessages = fetchedMessages.concat(Array.from(messages.values()));
  }

  let content =
    "# " +
    guild.name +
    "-" +
    channel.name +
    " -> " +
    messageCount +
    " messages\n";
  fetchedMessages.forEach((fetchedMessage) => {
    content += createMessageContent(fetchedMessage) + "\n";
  });
  const atc = new discord.MessageAttachment(
    Buffer.from(content),
    "guilds_readchan.md"
  );
  interaction.editReply({ files: [atc] });
}

async function writeChannelHandler(client, interaction) {
  const opts = interaction.options._hoistedOptions;
  const guildId = opts[0].value;
  const channelId = opts[1].value;
  const messageContent = opts[2].value;
  const guild = client.guilds.cache.get(guildId);
  if (guild == null) {
    interaction.editReply("Unknown guild id.");
    return;
  }
  let channel = guild.channels.cache.get(channelId);
  channel = channel ?? (await guild.channels.fetch(channelId));
  if (channel == null) {
    interaction.editReply("Unknown channel id.");
    return;
  }
  channel.send(messageContent);
}

const messageListenerRegistered = false;
const listeningChannels = {};

function listenChannelHandler(client, interaction) {
  const opts = interaction.options._hoistedOptions;
  const guildId = opts[0].value;
  const channelId = opts[1].value;

  if (!messageListenerRegistered) {
    client.on("messageCreate", handleMessage);
  }
  const key = guildId + ":" + channelId;
  const targetChannel = listeningChannels[key];
  if (targetChannel != null) {
    listeningChannels[key] = null;
    interaction.editReply("stopped listening channel-" + key);
  } else {
    listeningChannels[key] = interaction.channel;
    interaction.editReply(
      "started listening channel-" + key + "- (please don't abuse this)"
    );
  }
}

function handleMessage(message) {
  if (message.author.bot) {
    return;
  }

  const targetChannel =
    listeningChannels["all:all"] ??
    listeningChannels[message.guildId + ":all"] ??
    listeningChannels[message.guildId + ":" + message.channelId];
  if (targetChannel == null) {
    return;
  }

  // you dont need to listen messages for the same channel, you already see the messages on that channel
  if (isSameChannel(message, targetChannel.id)) {
    return;
  }

  targetChannel.send(createMessageContent(message));
}

function isSameChannel(message, targetChannelId) {
  return message.channelId == targetChannelId;
}

const timeFormat = {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
};
function createMessageContent(message) {
  const attachments =
    message.attachments != null && message.attachments.size > 0
      ? Array.from(message.attachments.map((x) => x.proxyURL)).join("\n")
      : null;
  const files =
    message.files != null && message.files.size > 0
      ? Array.from(message.files.map((x) => x.proxyURL)).join("\n")
      : null;
  const guildName = message.guild.name.slice(0, 12);
  const channelName = message.channel.name.slice(0, 12);
  const formattedDate = message.createdAt.toLocaleDateString(
    "en-US",
    timeFormat
  );
  let content = `${guildName}:${channelName}:${message.author.username}:${formattedDate}> ${message.content}`;
  if (files != null) {
    content += "\n" + files;
  }
  if (attachments != null) {
    content += "\n" + attachments;
  }
  return content;
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
