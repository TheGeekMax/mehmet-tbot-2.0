const config = require('../config.json');

const Discord = require('discord.js');
const fs = require('fs');
const { parse } = require('csv-parse');
const { EmbedBuilder} = require('discord.js');
//cron
const cron = require('node-cron');

let rights = [];
for(let i = 0 ; i < config.droit.length;i++){
    rights.push(eval("Discord.GatewayIntentBits."+config.droit[i]));
}

const client = new Discord.Client({intents: rights});
client.login(config.token);

function getIdFromName(tag) {
    console.log("get id from name : "+tag)

    console.log(client.users.cache);

    const user = client.users.cache.find((u) => u.tag === tag);
    return user ? user.id : null;
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    //on envoie le message tous les jours à 8h
    cron.schedule('0 8 * * *', () => {
        sendBirth();
    });

});


function sendBirth(){
    fs.readFile('../birth.csv', async (err, fileData) => {
        if (err) {
            console.error(err);
            return;
        }

        parse(fileData, {columns: false, trim: true}, async (err, rows) => {
            if (err) {
                console.error(err);
                return;
            }
            //on recupere la date d'aujourd'hui sous forme JJ-MM
            let today = new Date();
            let date = today.getDate()+'-'+(today.getMonth()+1);
            
            let mess = "# Anniversaires du jour\n## joyeux anniversaire à :\n";
            //message sous type "> NOM : <@ID>"

            await client.guilds.cache.get(config.guild).members.fetch()

            let qts = 0;

            for(let i = 0 ; i < rows.length;i++){
                if(rows[i][3] == date){
                    mess += "> "+rows[i][1]+" : <@"+getIdFromName(rows[i][2])+">\n";
                    qts ++;
                }
            }

            if(qts == 0){
                mess += "> personne ...\n";
            }
            //on envoie test dans le salon d'id config.salonBirth
            client.channels.cache.get(config.salonBirth).send(mess).then((message) => {
                //on stop le programme
                process.exit(0);
            });
        });
    });
}