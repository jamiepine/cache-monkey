//the npm packages read-chunk and file-type are required
const fs = require('fs');
const readChunk = require('read-chunk');
const fileType = require('file-type');
const homeDir = require('os').userInfo().homedir
const cacheLocation = `${homeDir}/.config/discord/Cache/`
const convertedFiles = `${homeDir}/CachedFiles/`;
const regex = /(https?:\/\/\w*\.\w*\.?\w+\/[A-Za-z\/0-9_\-\(\)]*(\.png|\.gif|\.jpg|\.jpeg}\.mp4\.mp3\.webm\.webp\.gifv))/
if (!fs.existsSync(`${homeDir}/CachedFiles/`)) fs.mkdirSync(`${homeDir}/CachedFiles/`)

while (true) {
    try {
        fs.readdirSync(cacheLocation).forEach(e => {
            if (fs.lstatSync(`${cacheLocation}${e}`).isDirectory()) return;
            var thing1 = fs.readFileSync(`${cacheLocation}${e}`);
            var thing2 = thing1.slice(thing1.toString('utf8').indexOf('https://'));
            if (thing2.length < 3640 || thing1.toString('utf8').indexOf('https://') === -1) /* console.error('No data found in cache file.') */ return;
            else if (thing2.toString('utf8').match(regex) === null) /* console.log('Cannot find valid image or file format is invalid.') */ return;
            else {
                var fileName = `${e}${thing2.toString('utf8').match(regex).slice(2).filter(v => typeof v !== 'undefined')[0]}`
                if (fs.existsSync(`${convertedFiles}${fileName}`)) return;
                fs.writeFileSync(`${convertedFiles}${fileName}`, thing2.slice(thing2.toString('utf8').match(regex)[0].length));
                const buffer = readChunk.sync(`${convertedFiles}${fileName}`, 0, fileType.minimumBytes);
        
                    if (fileType(buffer) === null) {
                        var notFixed = true;
                        for (var i = 0; notFixed; i ++) {
                            var thing3 = thing2.slice(thing2.toString('utf8').match(regex)[0].length).toJSON().data;
                            if (i > 50) notFixed = false;
                            for (var oooo = 0; oooo < i; oooo ++) {
                                thing3.shift();
                            }
                            thing3 = new Buffer.from(thing3);
                            fs.writeFileSync(`${convertedFiles}${fileName}`, thing3);
                            const buffer = readChunk.sync(`${convertedFiles}${fileName}`, 0, fileType.minimumBytes);

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