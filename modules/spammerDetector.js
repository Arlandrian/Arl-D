// Map to store recent messages for each guild
const guildMessages = new Map();

// Constant for spam threshold
const SPAM_THRESHOLD = 6; // Number of same messages send to detect the user as a spammer
const MAX_MESSAGES = 32; // Constant for the maximum number of kept messages

// Function to check for spamming behavior and take action
function detectAndHandleSpam(message) {
  const guildId = message.guild.id;

  if (!guildMessages.has(guildId)) {
    guildMessages.set(guildId, []);
  }
  const messages = guildMessages.get(guildId);

  // Trim the messages array if it exceeds the maximum length
  if (messages.length >= MAX_MESSAGES) {
    messages.shift();
  }

  enoughContent = message.content.slice(0, 64), // no need to save all the content
  messages.push({
    author: message.author.id,
    content: enoughContent,
    channelId: message.channelId,
  });


  const recentMessages = messages.filter(
    (msg) => msg.author == message.author.id && msg.content == enoughContent
  );
  if (recentMessages.length >= SPAM_THRESHOLD) {
    const distinctChannels = new Set(
      recentMessages.map((msg) => msg.channelId)
    );
    if (distinctChannels.size >= SPAM_THRESHOLD) {
      const member = message.guild.members.cache.get(message.author.id);
      member
        .ban({ reason: "Spamming detected", deleteMessageSeconds: 7200 }) // delete last 2 hours messages
        .then(() => {
          console.log(`${message.author.tag} has been banned for spamming.`);
        })
        .catch(console.error);
      return true;
    }
  }
  return false;
}

module.exports = { detectAndHandleSpam };
