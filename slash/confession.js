const logger = require("../modules/logger")
exports.run = async (client, interaction) => { // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: true });
  const {db} = client

  // Check if the targetted channel is a confession channel
  let targettedChannel = interaction.channel.id
  let channels = await db.getConfessionChannels(interaction.guild.id)
  if(!channels.includes(targettedChannel)){
    let modifier = ""
    if(channels.length > 1){
      modifier = `You can use here <#${channels[0]}>.`
    }
    await interaction.editReply("This is not a confession channel. "+modifier)
    return;
  }

  // Create a message and send it to channel
  let opts = interaction.options._hoistedOptions;
  let confession = opts[0].value
  let nick = opts.length > 1 ? opts[1].value : null;
  let msg = ""
  if(nick != null){
    msg += nick
    msg += ": "
  }
  msg += `${confession}`
  logger.log(`${interaction.user.tag} confession ${msg}`)
  interaction.channel.send(msg)
  await interaction.editReply("Your confession is sent.")
};

exports.commandData = {
  name: "confession",
  description: "It enables you to send an anonymous message on the predefined confession channels.",
  descriptionLocalizations: "",
  options: [
    {
      "name": "confession",
      "description": "Content of the confession.",
      "type": 3,
      "required": true
    },
    {
      "name": "nick",
      "description": "You can specify an anonymous nick.",
      "type": 3,
      "required": false
    }
  ],
  defaultPermission: true,
  type: 1
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "User",
  guildOnly: false
};