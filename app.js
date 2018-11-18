#!/usr/bin/env node
'use strict';
const meow = require('meow');
let InstaScrape = require('./index')

const cli = meow(`
	Usage
	  $ node app.js instascrape <input>

	Options
      --handle, -h  User Handle
      --timestamp, -t Timestamp upto which you want posts to be fetched (optional)
      --hashtag, -ht Match posts with a specific hashtag (optional)
      --count -c Extract certain number of posts (optional)
      --filetype -f  ( json_file, yaml_file ) Output file type ( Default .json ) (optional)
      --filename -n  Output file name ( Default instagram )

	Examples
	  $ node app.js instascrape -h danbilzerian -c 10
	  🌈 unicorns 🌈
`, {
	flags: {
		handle: {
			type: 'string',
			alias: 'h'
        },
        timestamp: {
            type: 'string',
            alias: 't'
        },
        hashtag: {
            type: 'string',
            alias: 'ht'
        },
        count: {
            type: 'string',
            alias: 'c'
        },
        filetype: {
            type: 'string',
            alias: 'f'
        },
        filename: {
            type: 'string',
            alias: 'n'
        }
	}
});

let input = cli.input[0], flags = cli.flags

console.log(input, flags)

if (input != "instascrape") 
    return console.log("error in CLI input. TYPE [ node app.js --help ] for more details")

let user = { 
    handle: flags.h || "danbilzerian",
    timestamp: flags.t || "2017-09-04T11:42:12.000Z",
    match_tag: flags.ht || "",
    no_of_posts: parseInt(flags.c) || 1000 
}

let options = {
    users: [ user ],
    cool_down_time: 0,
    result_format: flags.f || "json_file",
    result_file_name: flags.n || "extract"
}
console.log(options)

InstaScrape(options)
    .then(res => console.log("DONE"))
    .catch(err => console.log(err, "SOMETHING WENT WRONG"))
