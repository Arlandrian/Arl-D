const discord = require("discord.js");
const logger = require("../modules/logger")
exports.run = async (client, interaction) => { // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: true });

  let requester = interaction.user
  let message = interaction.targetMessage;

  let content = createContent(message)
                  .replace("\n\n","\n") // clear extra lines

  let embeds = message.embeds != null && message.embeds.length > 0 ? Array.from(message.embeds?.values()) : null;
  embeds = embeds?.filter(element => element.description != null);

  await requester.dmChannel.send(
  {
    content: content,
    embeds: embeds
  });

  logger.log(`[${requester.tag}] used [DM this to me] [guild id]: ${interaction.guildId} [channel id]: ${message.channel.id} [message id]: ${message.id}`)

  let embedMessage = new discord.MessageEmbed()
    .setTitle("Arl-D")
    .setDescription(`Dm Sent.`)
    .addFields(
      [{ name: '-->', value: `[Go to message](${message.url})` }]
    )
    .setTimestamp()
    .setColor("#ddbb11")

  await interaction.editReply({embeds:[embedMessage]});
};

function createContent(message){
  let attachments = message.attachments != null && message.attachments.size > 0? Array.from(message.attachments.map(x=>x.proxyURL)).join("\n") : null;
  let files = message.files != null&& message.files.size > 0 ? Array.from(message.files.map(x=>x.proxyURL)).join("\n") : null;
  let content = `Sent by: ${message.author}. ChannelId:${message.channel.id} MessageId: ${message.id}.\n${message.content}`

  if(files != null){
    content += "\n"+files
  }
  if(attachments != null){
    content += "\n"+attachments
  }
  return content
}

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