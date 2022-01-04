require("colors");

const { Client:DClient, MessageEmbed, WebhookClient, Intents } = require("discord.js");
const client = new DClient( { intents: Intents.ALL } );
client.prefix = ",";

client.on("ready", async () => {
    let prompt = `[Twitch] ${client.user.tag} is now online!`;
    console.log(prompt.cyan);
    client.users.resolve("251091302303662080").send(prompt)
});

let test = new WebhookClient(process.env.testHookID, process.env.testHookToken);

client.login(process.env.TOKEN).catch((err)=> {
    if (err) throw err;
})



const { Client } = require("youtubei");
const youtube = new Client();

const sqlite3 = require('sqlite3').verbose();
const youtubersOBJ = require("./db/youtubersINIT.json");
let db = new sqlite3.Database('./db/youtubersDB.db', (err) => {
    if (err) throw err.message;
    console.log('Connected to the youtuber database.'.brightGreen);
});

db.run("CREATE table IF NOT EXISTS youtubersTBL (NAME TEXT, LIVE BOOLEAN DEFAULT false, UNIQUE(NAME))", function (err) {
    if (err) throw err;
    console.log(this);
    let stmt = db.prepare("INSERT or IGNORE into youtubersTBL values (?, ?)", (err) => { if (err) throw err; });
    
    for (x in youtubersOBJ) stmt.run(x, youtubersOBJ[x]);

    setInterval(function() { 

        db.each("SELECT * FROM youtubersTBL", async function (err, row) {
            if (err) throw err;
            console.log(`Name: ${row.NAME}: ${row.LIVE}`.brightYellow);
            // Update the specific youtuber's value for name or live state.
            let stmt2 = db.prepare("UPDATE youtubersTBL SET LIVE = ? WHERE NAME = ?",  (err) => { if (err) throw err; })

            // Look for the youtuber if they are live.
            let video = await youtube.findOne(`${row.NAME} live`, {type: "video"})
            if (!video) return console.log("No Search Result")
            // If the youtuber found is matching and live...
            if (video.channel.name === row.NAME && video.isLiveContent) {
                // if the youtuber was not previously streaming (not (expected false) === not streaming),
                if (!row.LIVE) {
                    // Set the youtuber to now streaming (true === streaming)
                    console.log(row.NAME, "is now Live!".brightCyan);
                    test.send(row.NAME + " is now Live!");
                    stmt2.run(true, row.NAME)  // turn from offline to online
                } else {
                    console.log(row.NAME, "was already online.");
                    // handle case if streamer is online and has live content and db shows as online

                }
                
            } 
            // if streamer not found (or) streamer found but no live content (and) streamer in db shows online, emit youtuber went offline.
            else if ((video.channel.name !== row.NAME || !video.isLiveContent) && row.value ) { 
                console.log(row.NAME, "is now offline.".brightMagenta);
                test.send(row.NAME + " is now offline.");
                stmt2.run(false, row.NAME)  // turn from online to offline
            } else {
                // handle case if streamer offline and db shows them as offline: do nothing
            }



            //              FIX OLD STATE BY REVERTING LIVE BOOL by code below.
            // console.log(`${row.NAME} is ${row.LIVE ? "Now Offline" : "Now Online"}`);
            // let stmt2 = db.prepare("UPDATE youtubersTBL SET LIVE = ? WHERE NAME = ?",  (err) => { if (err) throw err; })
            // stmt2.run(!row.LIVE, row.NAME)

        }, function(err, count) {
            if (err) throw err;
            console.log(`All Done! Count: ${count}`);
            
        });

    }, 10000)

})

process.on("SIGINT", async () => {
    console.log('Closing script & the database connection.'.brightYellow);
    
    db.close((err) => {
        if (err) throw err.message;
        console.log('Closed the database connection.'.brightYellow);
    });

    process.exit()
});
