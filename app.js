//discord , main
const Discord = require('discord.js');
const config = require('./config.json');
const keywords = require('./keywords.json');
const fs = require('fs');
const { parse } = require('csv-parse');

//discord , commands 
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder} = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');

const commandes = require("./commands.json");


//demarage du bot
let rights = [];
for(let i = 0 ; i < config.droit.length;i++){
    rights.push(eval("Discord.GatewayIntentBits."+config.droit[i]));
}

const client = new Discord.Client({intents: rights});
client.login(config.token);

//ajout du rest api pour envoyer les commandes
const rest = new REST({ version: '9' }).setToken(config.token);

client.on('ready', async (client) =>  {
    client.user.setActivity(config.activity, { type: 'PLAYING' });
    console.log(`Logged in as ${client.user.tag}!`);

    console.log("creation des commandes ...");
    let commands = [];
    for (let i = 0 ; i < commandes.length;i++){
        //ajout des premier detailes
        let current = new SlashCommandBuilder();
        current.setName(commandes[i].name);
        current.setDescription(commandes[i].description);

        //ajout des arguments (si besoins)
        for(let j = 0 ; j < commandes[i].args.length;j++){
            let curArg = commandes[i].args[j];
            switch(curArg.type){
                case "int":
                    current.addIntegerOption(option =>
                        option.setName(curArg.name)
                            .setDescription(curArg.description)
                            .setRequired(curArg.needed)
                    );
                break;
                case "bool":
                    current.addBooleanOption(option =>
                        option.setName(curArg.name)
                            .setDescription(curArg.description)
                            .setRequired(curArg.needed)
                    );
                break;
                case "mention":
                    current.addMentionableOption(option =>
                        option.setName(curArg.name)
                            .setDescription(curArg.description)
                            .setRequired(curArg.needed)
                    );
                break;
                case "role":
                    current.addRoleOption(option =>
                        option.setName(curArg.name)
                            .setDescription(curArg.description)
                            .setRequired(curArg.needed)
                    );
                break;
                case "string":
                    current.addStringOption(option =>
                        option.setName(curArg.name)
                            .setDescription(curArg.description)
                            .setRequired(curArg.needed)
                    );
                break;
                case "channel":
                    current.addChannelOption(option =>
                        option.setName(curArg.name)
                            .setDescription(curArg.description)
                            .setRequired(curArg.needed)
                    );
                break;
            }
        }
        commands.push(current);
    }

    //creation des routes

    await rest.put(
        Routes.applicationCommands(config.bot),
        { body: commands },
    );

    console.log("commandes cree !");

    //on liste tout les gens dans la console qui n'ont pas le role 1A
    let role = client.guilds.cache.get(config.guild).roles.cache.get(config.role1A);
    let memberlist = []
    await client.guilds.cache.get(config.guild).members.fetch().then((members) => {
        members.forEach((member) => {
            //si il a 0 roles et qu'il n'est pas un bot
            if(member.roles.cache.size == 1 && !member.user.bot){
                //on leurs ajoute le role 1A
                addRoleToClient(member,role);
            }
        });
    });

    console.log("ajout des roles 1A fini !");
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    let options = interaction.options._hoistedOptions;
    let args = {};

    for(let i = 0 ; i < options.length; i++){
        args[options[i].name] = options[i].value;
    }

    eval(interaction.commandName+"(interaction,args)");
})

function addRoleToClient(member,role){
    member.roles.add(role);
}

client.on("guildMemberAdd", async member => {
    //On get le role des 1A par id
    let role = member.guild.roles.cache.get(config.role1A);
    //On ajoute le role au membre
    addRoleToClient(member,role);
});

//partie qui s'occupe de repondre de la merde si on dit certaines choses (et dans certains cas, on ajoute un emojy)
client.on("messageCreate", async message => {
    if(message.author.bot) return;

    //on recup toute les clefs de keywords
    let keys = Object.keys(keywords);
    //on parcours les clefs
    for(let i = 0 ; i < keys.length;i++){
        if(isValidText(message.content,keys[i])){
            let key = keys[i];
            let current = keywords[key];
            //soit c'est un message, soit une reponse emojy
            //on prend un nombre au pif entre 0 et le poids total
            let rand = Math.floor(Math.random() * current.totalWeight*100)%current.totalWeight;
            //on parcours les reponses jusqu'a trouver la bonne
            let rep;
            for(let j = 0 ; j < current.reply.length;j++){
                if(rand <= current.reply[j].weight){
                    rep = current.reply[j].message;
                    break;
                }else{
                    rand -= current.reply[j].weight;
                }
            }

            if(current.isReply){
                message.reply({ content: rep, allowedMentions: { parse: [] }});
            }else{  
                message.react(rep);
            }
        }
    }
});

function isValidText(text,tofind){
    //on remplace les ponctuations par des espaces
    return text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," ").split(" ").includes(tofind);
}

function getIdFromName(tag) {
    const user = client.users.cache.find((u) => u.tag === tag);
    return user ? user.id : null;
}

//commandes
async function hi(int, args){
    int.reply("Hello world !");
    
}

function emulaterole(int, args){
    //si c'est pas moi
    if(int.member.id != config.author){
        int.reply("t'as cru que tu pouvais utiliser une commande de mon grand maitre inteligent ?\nMDR");
        return;
    }
    addRoleToClient(int.member,int.guild.roles.cache.get(args.role));
    int.reply("ca marche\nhttps://tenor.com/6ECe.gif")
}



function anniv_list(int,args){

    fs.readFile('birth.csv', (err, fileData) => {
        if (err) {
            console.error(err);
            return;
        }

        parse(fileData, {columns: false, trim: true}, (err, rows) => {
            if (err) {
                console.error(err);
                return;
            }
            //on l'imprime
            console.log(rows);
            //on formate via un embed
            let embed = new EmbedBuilder()
                .setTitle("Liste des anniversaires")
                .setDescription("Voici la liste des anniversaires")
                .setColor("#ff0000");

            for(let i = 1 ; i < rows.length;i++){
                embed.addFields({
                    name:rows[i][1] + " le " + rows[i][3].replace("-","/"),
                    inline:false
                });
            }

            int.reply({embeds:[embed]});
        });
    });

}

function rand(int, args){
    int.reply((Math.floor(Math.random() * args.max) + 1).toString()+" / "+args.max);
}

function testembed(int, args){
    int.reply({embeds:[embed_maker({
        title:args["title"],
        description:args["description"],
        url:"https://discord.js.org/",
        color:"#ff0000",
        fields:[
            {
                "name":"name",
                "value":"value",
                "inline":true
            }
        ]
    })]});
}