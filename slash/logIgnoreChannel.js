const { codeBlock } = require("@discordjs/builders");
const {removeItemOnce} = require("../modules/functions")

exports.run = async (client, interaction) => { // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: true });
  const {db} = client

  let guildId = interaction.guild.id;
  let opts = interaction.options._hoistedOptions;
  let targettedChannelId = opts.length > 0 ? opts[0].value : interaction.channel.id;

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
    }
  ],
  defaultPermission: true,
  type: 1
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "Administrator",
  guildOnly: true
};