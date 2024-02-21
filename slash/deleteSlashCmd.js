const discord = require("discord.js");
const logger = require("../modules/logger")
exports.run = async (client, interaction) => { 
  await interaction.deferReply({ ephemeral: true });
  let opts = interaction.options._hoistedOptions;
  if(opts[0].value == null){
    await interaction.editReply("Please enter a command name")
    return;
  }
  let name = opts[0].value

  const id = await deleteApplicationCommand(client, name)
  if(id){
    await interaction.editReply("Successfully deleted the command: "+name)
    logger.log(`Command is deleted :${name}`)
  }else{
    await interaction.editReply("Couldnt find the command.")
  }
};

async function deleteApplicationCommand(client, name) {
  if (client.application.commands.cache.size() == 0) {
    await client.application.commands.fetch();
  }
  const id = client.application.commands.cache.find((x) => x.name == name);
  if(id==null){
    return id
  }
  await client.application.commands.delete(id);
  return id
}

exports.commandData = {
  name: "deleteslashcmd",
  description: "Deletes a slash command. (Use with caution)",
  descriptionLocalizations:  {},
  options: [
    {
      "name": "cmdname",
      "description": "name of the command (main name only! subcommands are not supported, all or none)",
      "type": 3,
      "required": true
    }
  ],
  defaultMemberPermissions: discord.Permissions.FLAGS.BAN_MEMBERS,
  type: 1
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "Bot Owner",
  guildOnly: false
};