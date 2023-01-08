const logger = require("../modules/logger.js");
const discord = require("discord.js");

module.exports = async (client, message) => {
  // Ignore direct messages
	if (!message.guild) return;

  // ignore ignored channels
  const {db} = client
  let channels = await db.getLogIgnoreChannels(message.guild.id)
  if(channels.includes(message.channel.id)) return;
  
	const fetchedLogs = await message.guild.fetchAuditLogs({
		limit: 1,
		type: discord.GuildAuditLogs.Actions.MESSAGE_DELETE
	});
	// Since there's only 1 audit log entry in this collection, grab the first one
	const deletionLog = fetchedLogs.entries.first();

  const author = message.author ?? message.member

	// Perform a coherence check to make sure that there's *something*
	if (!deletionLog) return console.log(`[messageDelete] in channel ${message.channel.name} by ${author.tag}. but no relevant audit logs were found.`);

	// Now grab the user object of the person who deleted the message
	// Also grab the target of this action to double-check things
	const { executor, target } = deletionLog;

  let content = createContentMessage(message);

	// Update the output with a bit more information
	// Also run a check to make sure that the log returned was for the same author's message
	if (target.id === author.id) {
		logger.log(`[messageDelete] in channel ${message.channel.name} by ${author.tag}. executor ${executor.tag}.\n${content}`.replace("\n\n","\n"));
	} else {
		logger.log(`[messageDelete] in channel ${message.channel.name} by ${author.tag}. executor unknown.\n${content}`.replace("\n\n","\n"));
	}
};

function createContentMessage(message){
  let content = message.content

  let files = message.files != null && message.files.length > 0 ? Array.from(message.files.map(x=>x.proxyURL)).join("\n") : null;
  if(files != null){
    content += "\n"+files
  }

  let attachments = message.attachments != null && message.attachments.length > 0 ? Array.from(message.attachments.map(x=>x.proxyURL)).join("\n") : null;
  if(attachments != null){
    content += "\n"+attachments
  }

  let embeds = message.embeds != null && message.embeds.length > 0 ? Array.from(message.embeds?.values()) : null;
  embeds = embeds?.filter(x => x.description != null)
    .map(x => x.description).join("\n");
  if(embeds != null){
    content += "\n"+embeds
  }
  return content
}