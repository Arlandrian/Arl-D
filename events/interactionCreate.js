const logger = require("../modules/logger.js");
const { getSettings, permlevel } = require("../modules/functions.js");
const config = require("../config.js");
// const adminP = require("../modules/adminPanel.js");

module.exports = async (client, interaction) => {
  // if (interaction.isSelectMenu()) {
  //   await adminP.panel(client, interaction);
  //   return;
  // }

  // If it's not a command, stop.
  if (!interaction.isCommand() && interaction.type != "APPLICATION_COMMAND")
    return;

  // Grab the settings for this server from Enmap.
  // If there is no guild, get default conf (DMs)
  const settings = (interaction.settings = getSettings(interaction.guild));

  // Get the user or member's permission level from the elevation
  const level = permlevel(interaction);

  // Grab the command data from the client.container.slashcmds Collection
  const cmd = client.container.slashcmds.get(interaction.commandName);

  // If that command doesn't exist, silently exit and do nothing
  if (!cmd) return;

  // Since the permission system from Discord is rather limited in regarding to
  // Slash Commands, we'll just utilise our permission checker.
  if (level < client.container.levelCache[cmd.conf.permLevel]) {
    // Due to the nature of interactions we **must** respond to them otherwise
    // they will error out because we didn't respond to them.
    return await interaction.reply({
      content: `This command can only be used by ${cmd.conf.permLevel}'s only`,
      // This will basically set the ephemeral response to either announce
      // to everyone, or just the command executioner. But we **HAVE** to
      // respond.
      ephemeral: settings.systemNotice !== "true",
    });
  }

  // If everything checks out, run the command
  try {
    const subCommand = interaction.options.getSubcommand()??""
    const options = interaction.options?._hoistedOptions?.map(option => {
      return option.value ?`${option.name}: ${option.value}`:null;
    }).join(', ');
    logger.log(
      `${config.permLevels.find((l) => l.level === level).name} ${
        interaction.user.id
      } ran slash command ${interaction.commandName} ${subCommand} ${options}.`,
      "cmd"
    );
    await cmd.run(client, interaction);
  } catch (e) {
    console.error(e);
    let content = `There was a problem with your request.\n`;
    let files = null;
    if (e.length > 1900) {
      atc = new discord.MessageAttachment(Buffer.from(output), "err.txt");
      files = [atc];
    } else {
      content += e;
    }
    const resp = {
      content: content,
      ephemeral: true,
      files: files,
    }
    if (interaction.replied)
      interaction
        .followUp(resp)
        .catch((e) =>
          console.error("An error occurred following up on an error", e)
        );
    else if (interaction.deferred)
      interaction
        .editReply(resp)
        .catch((e) =>
          console.error("An error occurred following up on an error", e)
        );
    else
      interaction
        .reply(resp)
        .catch((e) =>
          console.error("An error occurred replying on an error", e)
        );
  }
};
