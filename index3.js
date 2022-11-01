const { Client, Intents, Partials } = require("discord.js");
const opts = {
    intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MEMBERS ],
    partials: [ "USER", "GUILD_MEMBER" ]
};
const client = new Client(opts);

const token = "MTAzNzA2NDA1NTQzODk3NTEyNw.GEfNSW.8ijriBp_2HVU3GQvz5Xmgg8ld38qJ8oln1wK9o"
var inviteLink = "";
client.on("messageCreate", function(message){
    console.log(`a message was created`);
    console.log({message});
});

client.on("ready", function(){
    console.log(`the client becomes ready to start`);
	console.log(`I am ready! Logged in as ${client.user.tag}!`);
	console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
});

client.on("userUpdate", function(oldUser, newUser){
    console.log(`user's details (e.g. username) are changed`);
});

client.on("guildMemberUpdate", function(oldMember, newMember){
    console.log(`a guild member changes - i.e. new role, removed role, nickname.`);
    console.log({oldMember, newMember});
});

client.on("presenceUpdate", function(oldMember, newMember){
    console.log(`a guild member changes - i.e. new role, removed role, nickname.`);
    console.log({oldMember, newMember});
});
client.login(token);