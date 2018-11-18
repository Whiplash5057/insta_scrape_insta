let { UserPosts } = require('./instagram')

let InstaScrape = async (options) => {
    try {
        let Scraper = new UserPosts(options)
        return await Scraper.getUserPosts()
    } catch (err) {
        return err
    }
}

module.exports = InstaScrape