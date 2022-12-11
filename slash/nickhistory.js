const discord = require("discord.js"); 

exports.run = async (client, interaction) => { // eslint-disable-line no-unused-vars
  //await interaction.deferReply({ephemeral: true});
  await interaction.deferReply({ephemeral: false});

  const { db } = client;
  let channels =  await db.getNickLogChannels(interaction.guild.id)
  if(channels.length < 0){
    await interaction.editReply("Couldnt get log channels from db");
    return
  }

  let logChannelId = channels[0]
  if(logChannelId == null){
    await interaction.editReply("There is no log channels set!");
    return
  }

  let logChannel = client.guilds.cache.get(interaction.guildId)?.channels?.cache?.get(logChannelId);
  if(logChannel == null){
    logChannel = client.guilds.cache.get(interaction.guildId).channels.fetch(logChannelId)
  }

  if(logChannel == null){
    await interaction.editReply("Couldnt find log channel!");
    return
  }

  let user = interaction.targetUser;
  messages = await getAllMessagesInTheChannel(logChannel)

  let messagesContainingId = messages.filter(x=>x[1].content.includes(user.id))
  let reply = messagesContainingId.map(x=>x[1].content).join('\n');
  if(messagesContainingId.length == 0){
    reply = "There is no log for this user."
  }
  reply += '\n'
  reply += `\nThere are ${messages.length} messages in the nick log channel.\n`

  if(reply.length < 2000){
    const rep = await interaction.editReply(reply);
  }else{
    await sendMessageAsTextFileAttachment(interaction, reply)
  }
};

async function sendMessageAsTextFileAttachment(interaction, content){
  let atc = new discord.MessageAttachment(Buffer.from(content), 'nicklog.txt');
  await interaction.editReply({ files: [atc] });
}

async function getAllMessagesInTheChannel(channel){
  return await lots_of_messages_getter(channel)
  /*
  if(channel.isAllMessagesCached == null){
    allMessages = await lots_of_messages_getter(channel)
    channel.nickLog = true
  }
  return channel.messages.cache
  */
}

async function lots_of_messages_getter(channel, limit = 2000) {
    const sum_messages = [];
    let last_id;

    while (true) {
        const options = { limit: 100, cache: true };
        if (last_id) {
            options.before = last_id;
        }

        const messages = await channel.messages.fetch(options);
        sum_messages.push(...messages);
        last_id = messages.last().id;

        if (messages.size != 100 || sum_messages >= limit) {
            break;
        }
    }

    return sum_messages;
}

exports.commandData = {
  name: "Nick History",
  //description: "Shows nick history of the user. Uses nicklog channel as a database.",
  options: [],
  defaultPermission: true,
  type: 2//ApplicationCommandTypes.USER
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "Admin",
  guildOnly: false
};