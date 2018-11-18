# InstaScrape

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)


InstaScrape is a scraping tool that allows programmers to extract publice user information without Logging into Instagram.

 - User Full Name
 - User Profile Image
 - User Follower Count
 - User Post FEED ( Picture & Video )

# Package Dependencies

 * [Puppeteer](https://pptr.dev) - Headless Chrome Node API.
 * [Lodash](https://lodash.com/) - A modern JavaScript utility library delivering modularity, performance & extras.
 * [util](https://www.npmjs.com/package/util) - Node.js's util module for all engines.
 * [write-yaml](https://www.npmjs.com/package/write-yaml) - Write YAML. Converts JSON to YAML writes it to the specified file.
 * [meow](https://www.npmjs.com/package/meow) - CLI app helper.

### Installation

InstaScrape requires [Node.js](https://nodejs.org/) 6.4.0+ to run.
Install the dependencies before running.

### If you want to run the API in the CLI

```sh
$ cd insta_scrape
$ npm install
$ node app.js instascrape -h danbilzerian -c 10
```

InstaScrape can extract only 1 users information through the CLI FOR NOW.

| Flags | Shorthand | Optional | Value |
| ------ | ------| ------ |------ |
| filetype | -f | YES | json( return an object ) / json_file / yml_file |
| timestamp | -t | YES | Date and Time upto which posts should be extracted  |
| handle | -h | NO | Instagram Handle Name  |
| filename | -n | YES | Custom file name  |
| count | -c | YES | Extract certain number of posts from the feed  |
| hashtag | -ht | YES | Match a specific hashtag in the feed |


### If you want to call the method in your program

```sh
let InstaScrape = require('insta_scrape')
let users = [
        {
            handle:"rik.roc",
            timestamp:"2018-09-04T11:42:12.000Z",
            match_tag:"", 
            no_of_posts: 20
        }
]
let options = {
    users,
    cool_down_time: 200,
    result_format: "json_file",
    result_file_name: "my_insta_profile"
}
let response = InstaScrape(options)
```
| Key | Optional | Value |
| ------ | ------ |------ |
| users | NO | Array of all users you want information about |
| cool_down_time | YES | Short setTimeOuts for the Garbage Collector to do its jog |
| result_format | YES | json( return an object ) / json_file / yml_file |
| result_file_name | YES | Custom file name  |

The following are the option provided to filter releavant posts from the feed.
| Key | Optional | Value |
| ------ | ------ |------ |
| handle | NO | Users Instagram Handle |
| timestamp | YES | Date and Time upto which posts should be extracted |
| match_tag | YES | Match a specific hashtag in the feed |
| no_of_posts | YES | Extract certain number of posts from the feed |

### Todos

 - Get Followers for Any User

License
----

MIT