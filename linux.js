//the npm packages read-chunk and file-type are required
const fs = require('fs');
const readChunk = require('read-chunk');
const fileType = require('file-type');

while (true) {
    try {
        fs.readdirSync('/home/alekeagle/.config/discord/Cache').forEach(e => {
            if (fs.lstatSync(`/home/alekeagle/.config/discord/Cache/${e}`).isDirectory()) return;
            var thing1 = fs.readFileSync(`/home/alekeagle/.config/discord/Cache/${e}`);
            var thing2 = thing1.slice(thing1.toString('utf8').indexOf('https://'));
            if (thing2.length < 3640 || thing1.toString('utf8').indexOf('https://') === -1) /* console.error('No data found in cache file.') */ return;
            else if (thing2.toString('utf8').match(/(https:\/\/cdn\.discordapp\.com\/avatars\/\w*\/\w*\/*(\.png|\.gif|\.jpg|\.jpeg)\?size=\d{3,4}|https:\/\/discordapp\.com\/assets\/\w*(\.png|\.gif|\.jpg|\.jpeg)|https:\/\/cdn\.discordapp\.com\/emojis\/\w*\/*(\.png|\.gif|\.jpg|\.jpeg)\?v=\d{1})/) === null) /* console.log('Cannot find valid image or file format is invalid.') */ return;
            else {
                var fileName = `${e}${thing2.toString('utf8').match(/(https:\/\/cdn\.discordapp\.com\/avatars\/\w*\/\w*\/*(\.png|\.gif|\.jpg|\.jpeg)\?size=\d{3,4}|https:\/\/discordapp\.com\/assets\/\w*(\.png|\.gif|\.jpg|\.jpeg)|https:\/\/cdn\.discordapp\.com\/emojis\/\w*\/*(\.png|\.gif|\.jpg|\.jpeg)\?v=\d{1})/).slice(2).filter(v => typeof v !== 'undefined')[0]}`
                if (fs.existsSync(`./RecoveredCache/${fileName}`)) return;
                fs.writeFileSync(`./RecoveredCache/${fileName}`, thing2.slice(thing2.toString('utf8').match(/(https:\/\/cdn\.discordapp\.com\/avatars\/\w*\/\w*\/*(\.png|\.gif|\.jpg|\.jpeg)\?size=\d{3,4}|https:\/\/discordapp\.com\/assets\/\w*(\.png|\.gif|\.jpg|\.jpeg)|https:\/\/cdn\.discordapp\.com\/emojis\/\w*\/*(\.png|\.gif|\.jpg|\.jpeg)\?v=\d{1})/)[0].length));
                const buffer = readChunk.sync(`./RecoveredCache/${fileName}`, 0, fileType.minimumBytes);
        
                    if (fileType(buffer) === null) {
                        var notFixed = true;
                        for (var i = 0; notFixed; i ++) {
                            var thing3 = thing2.slice(thing2.toString('utf8').match(/(https:\/\/cdn\.discordapp\.com\/avatars\/\w*\/\w*\/*(\.png|\.gif|\.jpg|\.jpeg)\?size=\d{3,4}|https:\/\/discordapp\.com\/assets\/\w*(\.png|\.gif|\.jpg|\.jpeg)|https:\/\/cdn\.discordapp\.com\/emojis\/\w*\/*(\.png|\.gif|\.jpg|\.jpeg)\?v=\d{1})/)[0].length).toJSON().data;
                            if (i > 1000) {console.error(`Unable to convert file successfully, a fix will come soon. File: ${fileName}`); notFixed = false;}
                            thing3.shift();
                            thing3 = new Buffer.from(thing3);
                            fs.writeFileSync(`./RecoveredCache/${fileName}`, thing3);
                            const buffer = readChunk.sync(`./RecoveredCache/${fileName}`, 0, fileType.minimumBytes);

                            if (fileType(buffer) !== null) {
                                console.log(`Successfully converted file ${fileName}`);
                                notFixed = false;
                            }
                        }
                    }else console.log(`Successfully converted file ${fileName}`);
            }
        });
    }catch (err) {console.error(err)}
}