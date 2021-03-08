require("colors");
const { Client } = require("youtubei");
const youtube = new Client();

const map = new Map();
map.set("ChilledCow", false);

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
