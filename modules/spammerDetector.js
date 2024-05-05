
// Map to store recent messages for each guild
const guildMessages = new Map();

// Constant for spam threshold
const SPAM_THRESHOLD = 4; // Number of same messages send to detect the user as a spammer
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
        messages.splice(0, messages.length - MAX_MESSAGES);
    }

    const recentMessages = messages.filter(msg => msg.author === message.author.id && msg.content === message.content);
    if (recentMessages.length >= SPAM_THRESHOLD) {
        const distinctChannels = new Set(recentMessages.map(msg => msg.channel));
        console.log("2:",distinctChannels)
        if (distinctChannels.size >= SPAM_THRESHOLD) {
            const member = message.guild.members.cache.get(message.author.id);
            member.ban({ reason: 'Spamming detected', deleteMessageSeconds: 7200 })// delete last 2 hours messages
                .then(() => {
                    console.log(`${message.author.tag} has been banned for spamming.`);
                })
                .catch(console.error);
            return true
        }
    }
    messages.push({ author: message.author.id, content: message.content });
    return false
}

module.exports = { detectAndHandleSpam };
