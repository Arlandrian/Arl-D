const { codeBlock } = require("@discordjs/builders");
const {removeItemOnce, isBotOwner} = require("../modules/functions")

exports.run = async (client, interaction) => { // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: true });
  const {db} = client

  let opts = interaction.options._hoistedOptions;
  let targettedChannelId = getOption(opts, "channel", interaction.channel.id);
  let guildId = getOption(opts, "guild", interaction.guild.id);

  // only bot owner can provide guildId option
  if (guildId != interaction.guild.id) {
    if(!isBotOwner(interaction)){
      await interaction.editReply("Only bow owner can provide the guild option.");
      return;
    }
  }

  let channels = await db.getLogIgnoreChannels(guildId)
  if(channels.includes(targettedChannelId)){
    // will remove
    let newChannelList = removeItemOnce(channels, targettedChannelId)
    await db.setLogIgnoreChannels(guildId, newChannelList)
    const reply = codeBlock("asciidoc", `👀 Stopped ignoring logging events on this channel 👀`);
    await interaction.editReply(reply)
    return;
  }
  else{
    // will add
    channels.push(targettedChannelId)
    await db.setLogIgnoreChannels(guildId, channels)
    const reply = codeBlock("asciidoc", `👀 Ignoring logging events on this channel 👀`);
    await interaction.editReply(reply)
  }
};

exports.commandData = {
  name: "log_ignore_channel",
  description: "Ignores the channels for logging.",
  descriptionLocalizations:  {},
  options: [
    {
      "name": "channel",
      "description": "Channel",
      "type": 7,
      "required": false
    },
    {
      "name": "guild",
      "description": "Guild ID",
      "type": 3,
      "required": false
    }
  ],
  defaultPermission: true,
  type: 1
};

function getOption(opts, name, defValue) {
  const provided = opts.find((x) => x.name.toLowerCase() == name.toLowerCase());
  if (provided == null) {
    return defValue;
  } else {
    return provided.value;
  }
}

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "Administrator",
  guildOnly: true
};