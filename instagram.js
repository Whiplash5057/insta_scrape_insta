const puppeteer = require('puppeteer');
const _ = require("lodash");
const { promisify } = require('util');
const fs = require('fs');
const writeFileAsync = promisify(fs.writeFile);

const {
    ERRORS,
    RESPONSE_STATUS,
    XPATH_POSTS,
    INSTA_BASE_URL
} = require("./config")

class Configuration {

    constructor(xpath, error, status, config = {}) {
        this.xp = xpath
        this.er = error
        this.st = status
        if (!_.isNumber(config.cool_down_time)) this.cool_down_time = 1000
        else this.cool_down_time = config.cool_down_time

        let moduleBuilder = new ModuleBuilder(config)
        this.builders = moduleBuilder.build()
    }

    async aggregatePromise(promise_list) {
        try {
            return Promise.all(promise_list)
        } catch (err) {
            throw {
                err
            }
        }
    }

    async delayPromise(time){
        return new Promise(resolve => setTimeout(resolve, time))
    }
}

class ModuleBuilder {
    constructor(building={}) {
        this.building = building
    }

    build() {
        try {

            let modules = { trigger: null, result_format: null }
    
            modules.trigger = this.buildTrigger()
    
            modules.result_format = this.buildResultFormat()
    
            return modules
            
        } catch (err) {
            return err
        }
    }

    buildTrigger() {
        let module = new Object()
        if (!!this.building.trigger == false) {
            module.driver = message => console.log(message)
            
            module.type = "console"
            return module
        }

        if(typeof this.building.trigger != "function")
            throw new Error("The trigger should be a function")

        module.driver = this.building.trigger
        module.type = "insertion"
        return module
    }

    buildResultFormat() {
        let module = new Object()
        let file_name = "instagram"

        if (!!this.building.result_file_name == true)
            file_name = this.building.result_file_name

        if (!!this.building.result_format == false || this.building.result_format == 'json') {
            module.driver = result => result
            module.type = "json"
            return module
        }

        if (this.building.result_format == 'json_file') {
            module.driver = result => writeFileAsync( `${file_name}.json`, JSON.stringify(result, null, 2) )
            module.type = "json_file"
            return module
        }

    }
}

class UserPosts extends Configuration {
    constructor(options) {
        let config = {
            result_format: options.result_format, 
            cool_down_time: options.cool_down_time,
            result_file_name: options.result_file_name
        }
        super(XPATH_POSTS, ERRORS, RESPONSE_STATUS, config)
        let users = options.users
        let enriched_user = _.reduce(users, (result, x) => {
            if (_.isEmpty(x.handle)) x.handle = ''
            if (_.isEmpty(x.timestamp)) x.timestamp = null
            if (_.isEmpty(x.match_tag)) x.match_tag = null
            if (!_.isNumber(x.no_of_posts)) x.no_of_posts = 10000
            
            return [...result, x]
        }, [])

        this.user_bulk = _.chunk(enriched_user, 3)
    }

    async initBrowser() {
        try {
            return await puppeteer.launch({
                headless: !this.interactive,
                args: ['--lang=en-US', '--disk-cache-size=0']
            });
        } catch (err) {
            throw new Error(`Error in Creating Browser Instance`)
        }
    }

    async createPage(user) {
        let page;
        try {
            page = await this.browser.newPage()
            let new_page = await page.goto(`${INSTA_BASE_URL}/${user.handle}/`, {
                waitUntil: 'networkidle0'
            });
            page._status = new_page._status
            this.pages[`page_${user.handle}`] = page
            await this.delayPromise(this.cool_down_time)
        } catch (err) {
            page = null
            delete this.pages[`page_${user.handle}`]
            throw new Error(`Error in Creating page for ${user.handle}, ${err}`)
        }
    }

    async closePage(user) {
        try {
            await this.pages[`page_${user.handle}`].close()
            delete this.pages[`page_${user.handle}`]
        } catch (err) {
            throw new Error(`Error in Closing page for ${user.handle}, ${err}`)
        }
    }

    async initializeHelperFunctions(user) {
        try {
            await this.pages[`page_${user.handle}`].exposeFunction('_', _);

            await this.pages[`page_${user.handle}`].evaluate(obj => {

                window.getInfo = async (path) => {
                    return await document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
                };

                window.wrapMe = async (fn) => {
                    try { return await fn() }
                    catch (error) { return null }
                }

                window.isPrivate = (private_user) => {
                    if (private_user != null || private_user != undefined) return true 
                    else return false
                }

                window.delay = (time) => {
                    return new Promise(resolve => setTimeout(resolve, time))
                }

            }, {});
        } catch (err) {
            throw new Error("SOMETHING WENT WRONG IN INITIALIZEING HELPER METHOD")
        }
    }

    async getPageInformation(user) {
        try {
            let obj = { xp: this.xp, er: this.er, st: this.st }

            if(this.pages[`page_${user.handle}`]._status == 404)
                return { status: this.st.page_not_found, error: this.er.page_not_found }

            await this.delayPromise(this.cool_down_time)

            return this.pages[`page_${user.handle}`].evaluate(async obj => {
                let {xp, er, st} = obj

                let private_user = await wrapMe(async () => await getInfo(xp.private))
                let is_private = await isPrivate(private_user)
                if (is_private) return { status: st.private_account, error: er.private_account }

                let firstPost =  await wrapMe(async () => await getInfo(xp.firstPost))
                let parentPostRow = await wrapMe(async () => await getInfo(xp.parentPostRow))
                let post_count = await wrapMe(async () => await getInfo(xp.numberOfPosts))

                if(firstPost != null) first_class = await firstPost.getAttribute("class").split(' ')[0]; else first_class = null
                if(parentPostRow != null) parent_row_class = await parentPostRow.getAttribute("class").split(' ')[0]; else parent_row_class = null

                post_count = post_count.innerText
                post_count = parseFloat(post_count.replace(/\,/g,'').match(/[0-9.]+/)[0])

                let insta_reach_text = await wrapMe(async () => await getInfo(xp.numberOfFollowers))
                let profile_picture = await wrapMe(async () => await getInfo(xp.userProfileImage))
                let full_name = await wrapMe(async () => await getInfo(xp.fullName))

                if(!!profile_picture) profile_picture = profile_picture.src
                else throw "profile_picture error"

                if(!!full_name) full_name = full_name.innerText
                else throw "full_name error"

                if(!!insta_reach_text) insta_reach_text = insta_reach_text.innerText
                else throw "insta_reach_text error"

                insta_reach = parseFloat(insta_reach_text.replace(/\,/g,'').match(/[0-9.]+/)[0])
                let checkIfThouand = insta_reach_text.match(/k/)
                let checkIfMillion = insta_reach_text.match(/m/)
                if (checkIfThouand) insta_reach = insta_reach * 1000
                if (checkIfMillion) insta_reach = insta_reach * 1000000

                return { full_name, profile_picture, insta_reach, post_count, first_class, parent_row_class, status: st.success, error: "" }
                
            }, obj)
        } catch (err) {
            return { status: this.st.something_went_wrong, error: this.er.something_went_wrong }
        }
    }

    async getPostInformation(info) {
        try {
            let obj = { row: info.row, user: info.user, xp: this.xp, er: this.er, st: this.st, first_class: info.first_class, parent_row_class: info.parent_row_class }
            let post_info =  await this.pages[`page_${info.user.handle}`].evaluate(async obj => {

                let {user, xp, er, st, first_class, parent_row_class, row} = obj
                let posts = []
                let post_list = await document.querySelectorAll(`.${parent_row_class}:nth-of-type(${row}) .${first_class}`)

                let orchiestrateExtract = async (counter) => {
                    /** 3a */
                    await openModel()

                    /** 3b */
                    let date = await checkDate()
                    if (user.timestamp == undefined || user.timestamp == null) user.timestamp = "2000-10-20T11:42:12.000Z"
                    if (date < user.timestamp) {posts.push(null); return posts}

                    /** 3c */
                    let is_video = await checkIfVideo()

                    /** 3d */
                    if (user.no_of_posts < ((row-1) * 3) + counter) {posts.push(null); return posts}

                    /** 4 */
                    // if(!is_video)
                    await extractPostInformation(!!is_video)
                }

                let openModel = async () => {
                    let box = await wrapMe(async () => await getInfo(xp.postImageContainer))
                    while (box == null || box == undefined) {box = await wrapMe(async () => await getInfo(xp.postImageContainer)); await delay(20)}
                }

                let checkDate = async () => {
                    let date = await wrapMe(async () => await getInfo(xp.date))
                    if (date == null || date == undefined) date  = await wrapMe(async () => await getInfo(xp.date_for_no_caption))
                    return await date.getAttribute('datetime')
                }

                let checkIfVideo = async () => {
                    let popup = await wrapMe(async () => await getInfo(xp.postModel))
                    let popupClass = popup.getAttribute("class").split(" ")[0]
                    let is_video = document.querySelector(`.${popupClass} video`)
                    return is_video
                }

                let getPostImage = async () => {
                    await delay(20)
                    let popup = await wrapMe(async () => await getInfo(xp.postModel))
                    let popupClass = await popup.getAttribute("class").split(" ")[0]
                    let post_images = await document.querySelectorAll(`.${popupClass} img`)
                    return Promise.resolve(post_images[1].src)
                }

                let getPostVideo = async () => {
                    await delay(20)
                    let popup = await wrapMe(async () => await getInfo(xp.postModel))
                    let popupClass = popup.getAttribute("class").split(" ")[0]
                    let post_videos = document.querySelectorAll(`.${popupClass} video`)
                    return Promise.resolve(post_videos[0].src)
                }

                let getPostLikes = async () => {
                    let likes = await wrapMe(async () => await getInfo(xp.likesPath))
                    if (likes.innerText == 'Log in to like or comment.\n') likes = 0
                    else {
                        likes = likes.innerText.replace(/\,/g,'').match(/\d+/)
                        if (likes) likes = parseInt(likes[0])
                        else likes = 1
                    }
                    return likes
                }

                let getPostCaption = async () => {
                    let caption = await wrapMe(async () => await getInfo(xp.caption))
                    if (caption != null || caption != undefined)
                        caption = caption.innerText
                    else
                        caption = ""
                    return caption
                }

                let getPostMentions = async () => {
                    let mentioned_handles
                    let handlesBoxClass = await getInfo(xp.mentionedHandlesContainer)
                    handlesBoxClass = handlesBoxClass.getAttribute("class").split(" ")[0]
                    let handle_anchors = document.querySelectorAll(`.${handlesBoxClass} a`)
                    handle_anchors = Array.from(handle_anchors)
                    if (handle_anchors.length > 0) mentioned_handles =  handle_anchors.map(anchor => anchor.innerText)
                    else mentioned_handles = []
                    return mentioned_handles.toString()
                }

                let getPostHashtags = async (caption) => {
                    let unprunedHashTags = caption.match(/(#[a-z\d-_]+)/gi);
                    if(unprunedHashTags == null || unprunedHashTags == undefined) hashtags = []
                    else hashtags = unprunedHashTags.map(tag => tag.trim())
                    return hashtags.toString()
                }

                let getPostId = async () => {
                    let pathname = window.location.pathname
                    let link_arr = pathname.split('/')
                    return link_arr[2]
                }

                let extractPostInformation = async (is_video) => {
                    
                    let handle = await user.handle

                    
                    let likes = await getPostLikes()
                    
                    let caption = await getPostCaption()
                    
                    let mentioned_handles = await getPostMentions()
                    
                    let hashtags = await getPostHashtags(caption)
                    
                    let insta_post_id = await getPostId()

                    let post_url = ""
                    if(!is_video)
                        post_url = await getPostImage()
                    else
                        post_url = await getPostVideo()

                    if( !!user.match_tag ) {
                        if( caption.toLowerCase().indexOf(user.match_tag.toLowerCase()) > -1 )
                            posts.push({ is_video, post_url, likes, caption, handle, mentioned_handles, hashtags, insta_post_id, status: st.success })
                    }
                    else {
                        posts.push({ is_video, post_url, likes, caption, handle, mentioned_handles, hashtags, insta_post_id, status: st.success })
                    }
                }

                let counter = 1

                for (let post_markup of post_list) {
                    post_markup.click()
                    await orchiestrateExtract(counter)
                    let close_click = await getInfo(xp.postModelClose)
                    close_click.click()
                    await delay(40)
                    counter++
                }

                return posts

            }, obj)

            await this.delayPromise(this.cool_down_time)
            return post_info

        } catch (err) {
            throw new Error(`Something went wrong in getPostInformation with ${err}`)
        }
    }

    async extractUserInfo(user) {
        try {
            this.builders.trigger.driver(`___ Crawl started for user ${user.handle} ___`)

            let posts = []

            await this.createPage(user)

            await this.delayPromise(this.cool_down_time)

            await this.initializeHelperFunctions(user)

            let page_information = await this.getPageInformation(user)
            switch (page_information.status) {
                case 404:
                    return Promise.resolve({error: this.er.page_not_found, status: this.st.page_not_found, user: user, posts: []})
                case 500:
                    return Promise.resolve({error: this.er.something_went_wrong, status: this.st.something_went_wrong, user: user, posts: []})
                case 300:
                    return Promise.resolve({error: this.er.private_account, status: this.st.private_account, user: user, posts: []})
                default:
                    break;
            }

            page_information.user = user

            let rows = parseInt(page_information.post_count / 3) + 1
            let range = [...Array(rows).keys()]
            for (let row of range) {
                page_information.row = row + 1
                let fresh_posts = await this.getPostInformation(page_information)
                posts = [ ...posts,  ...fresh_posts]
                let null_id = posts.indexOf(null)
                if (null_id > -1)
                    break
                this.builders.trigger.driver(`___ ${page_information.row} Rows Done For ${user.handle} :-) ___`)
            }
            posts = _.compact(posts)
            await this.closePage(user)

            await this.delayPromise(this.cool_down_time)

            this.builders.trigger.driver(`___ Crawl ended for user ${user.handle} ___`)
            delete page_information.user

            return Promise.resolve({status: this.st.success, error: "", user: {...page_information}, posts})
        } catch (err) {

            this.builders.trigger.driver(`___ ${this.er.something_went_wrong} for user ${user.handle} ${err} ___`)
            return {error: this.er.something_went_wrong, status: this.st.something_went_wrong, user: user, posts: []}
        }
    }

    async extractChunks() {
        try {
            let aggregation = []
            this.pages = {}

            for (const user_chunk of this.user_bulk) {
                let promise_array = user_chunk.map(user => this.extractUserInfo(user))
                aggregation = [ ...aggregation, ...await this.aggregatePromise(promise_array)]
            }
            
            await this.delayPromise(this.cool_down_time)

            return aggregation
        } catch (err) {
            throw new Error(`SOMETHING WENT WRONG IN extractChunks FUNCTION, ${err}`)
        }
    }

    async getUserPosts() {
        try {
            let response
            this.browser = await this.initBrowser()
            this.browser._process.once('close',()=>{ console.log("Browser Is Closed") });
            await this.delayPromise(this.cool_down_time)

            response = await this.extractChunks()

            await this.builders.result_format.driver(response)

            await this.browser.close();
            await this.delayPromise(this.cool_down_time)
            delete this.browser
            return response
        } catch (err) {
            await this.browser.close();
            delete this.browser
            throw new Error(`SOMETHING WENT WRONG IN getUserPosts FUNCTION, ${err}`)
        }
    }
}



module.exports = {UserPosts}