require("colors");
const { Client } = require("youtubei");
const youtube = new Client();

const sqlite3 = require('sqlite3').verbose();
const youtubersOBJ = require("./db/youtubersINIT.json");
let db = new sqlite3.Database('./db/youtubersDB.db', (err) => {
    if (err) throw err.message;
    console.log('Connected to the youtuber database.'.brightGreen);
});

db.serialize(function() {
    
    db.run("CREATE table IF NOT EXISTS youtubersTBL (name TEXT, live BOOL)");
    let stmt = db.prepare("INSERT into youtubersTBL values (?, ?)");
    for (x in youtubersOBJ) stmt.run(x, youtubersOBJ[x]);
})

db.each("SELECT * FROM youtubersTBL", function(err, row) {
    if (err) throw err;
    console.log(`Name: ${row.name} Live: ${row.live}`.brightYellow);
})

db.close((err) => {
    if (err) throw err.message;
    console.log('Closed the database connection.'.brightBlue);
});

// db.serialize(() => {
//     db.each(`SELECT YoutuberId as id, Name as name FROM youtubers`, (err, row) => {
//         if (err) {
//         console.error(err.message);
//         }
//         console.log(row.id + "\t" + row.name);
//     });
// }, closeDB(db));


process.on("SIGINT", async () => {
    console.log('Closing script & the database connection.'.brightYellow);
    // closeDB(db, process.exit);
    process.exit()
});

function closeDB(db, cb) {
    db.close((err) => {
        if (err) throw err.message;
        console.log('Closed the database connection.'.brightBlue);
    });

    if (cb) cb();
}

return;
setInterval(() => {
        
    map.forEach(async (value, key, map) => {
        let video = await youtube.findOne(`${key} live`, {type: "video"})
        
        // If the youtuber found is matching and live,
        if (video.channel.name === key && video.isLiveContent) {
            // if the youtuber was not previously streaming (false === not streaming),
            if (!value) {
                // Set the youtuber to now streaming (true === streaming)
                console.log(key, "is now Live!".brightCyan);
                map.set(key, !value);
                console.log(video)
            }

            
        } 
        // if streamer goes offline but db shows online, emit youtuber went offline.
        else if (value) {
            console.log(key, "is now Offline!".brightMagenta);
            map.set(key, !value);
        }

        console.log("INTERVAL EXECUTED".grey);
    })
}, 10000);

/*

return;
(async () => {
    let video = await youtube.findOne(`${channelName} live`, {type: "video"})
    // const videos = await youtube.search("Never gonna give you up", {
    //     type: "video", // video | playlist | channel | all
    // });

    
    if (video.channel.name === channelName && video.isLiveContent) {
        console.log("FOUND".brightGreen);
        console.log(video)
    } else {
        console.log("NOT FOUND".brightRed);
        console.log(video)
    }
})();

*/
