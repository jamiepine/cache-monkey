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
                var test = `${e}${thing2.toString('utf8').match(/(https:\/\/cdn\.discordapp\.com\/avatars\/\w*\/\w*\/*(\.png|\.gif|\.jpg|\.jpeg)\?size=\d{3,4}|https:\/\/discordapp\.com\/assets\/\w*(\.png|\.gif|\.jpg|\.jpeg)|https:\/\/cdn\.discordapp\.com\/emojis\/\w*\/*(\.png|\.gif|\.jpg|\.jpeg)\?v=\d{1})/).slice(2).filter(v => typeof v !== 'undefined')[0]}`
                if (fs.existsSync(`./TestFolder/${test}`)) return;
                fs.writeFileSync(`./TestFolder/${test}`, thing2.slice(thing2.toString('utf8').match(/(https:\/\/cdn\.discordapp\.com\/avatars\/\w*\/\w*\/*(\.png|\.gif|\.jpg|\.jpeg)\?size=\d{3,4}|https:\/\/discordapp\.com\/assets\/\w*(\.png|\.gif|\.jpg|\.jpeg)|https:\/\/cdn\.discordapp\.com\/emojis\/\w*\/*(\.png|\.gif|\.jpg|\.jpeg)\?v=\d{1})/)[0].length, thing2.length - 3640));
                const buffer = readChunk.sync(`./TestFolder/${test}`, 0, fileType.minimumBytes);
        
                if (fileType(buffer) === null) {
                    console.error(`Image may have been cached corrupted, or an unknown bug is affecting the file. Filename: ${test}`);
                }else console.log(`Successfully converted file ${test}`)
            }
        });
    }catch (err) {console.error(err)}
}
