const INSTA_BASE_URL = 'https://www.instagram.com'

let XPATH_PROFILE = {
    userProfileImage: '//*[@id="react-root"]/section/main/div/header/div/div/span/img',
    userName: '//*[@id="react-root"]/section/main/div/header/section/div[1]/h1',
    firstPost: '//*[@id="react-root"]/section/main/div/article/div/div/div[1]/div[1]',
    numberOfPosts: '//*[@id="react-root"]/section/main/div/header/section/ul/li[1]/span/span',
    numberOfFollowers: '//*[@id="react-root"]/section/main/div/header/section/ul/li[2]',
    following: '//*[@id="react-root"]/section/main/div/header/section/ul/li[3]',
    fullName: '//*[@id="react-root"]/section/main/div/header/section/div[2]/h1',
    userDescription: '//*[@id="react-root"]/section/main/div/header/section/div[2]/span',
    private: '//*[@id="react-root"]/section/main/div/div/article/div/div/h2'
}

let XPATH_POSTS = {
    postModel: '/html/body/div[3]/div/div[2]/div',
    postModelClose: '/html/body/div[3]/div/button',
    private: '//*[@id="react-root"]/section/main/div/div/article/div/div/h2',
    firstPost: '//*[@id="react-root"]/section/main/div/div/article/div[1]/div/div[1]/div[1]/a/div/div[2]',
    parentPostRow: '//*[@id="react-root"]/section/main/div/div/article/div[1]/div/div[1]',
    numberOfPosts: '//*[@id="react-root"]/section/main/div/header/section/ul/li[1]',
    postImageContainer: '/html/body/div[3]/div/div[2]/div/article/div[1]/div/div/div[1]',
    likesPath: '/html/body/div[3]/div/div[2]/div/article/div[2]/section[2]',
    username: '/html/body/div[3]/div/div[2]/div/article/header/div[2]/div[1]/div/h2/a',
    caption: '/html/body/div[3]/div/div[2]/div/article/div[2]/div[1]/ul/li[1]/div/div/div/span',
    mentionedHandlesContainer: '/html/body/div[3]/div/div[2]/div/article/div[1]/div/div', // ----> ALL THE (a) ANCHORS
    date: '/html/body/div[3]/div/div[2]/div/article/div[2]/div[2]/a/time',
    date_for_no_caption: '/html/body/div[3]/div/div[2]/div/article/div[2]/div/a/time',
    userProfileImage: '//*[@id="react-root"]/section/main/div/header/div/div/span/img',
    numberOfFollowers: '//*[@id="react-root"]/section/main/div/header/section/ul/li[2]',
    following: '//*[@id="react-root"]/section/main/div/header/section/ul/li[3]',
    fullName: '//*[@id="react-root"]/section/main/div/header/section/div[2]/h1',
    userDescription: '//*[@id="react-root"]/section/main/div/header/section/div[2]/span',
}


let XPATH_UNIQUE_POST = {
    private: '/html/body/div/div[1]/div/div/h2',
    date: '//*[@id="react-root"]/section/main/div/div/article/div[2]/div[2]/a/time',
    caption: '//*[@id="react-root"]/section/main/div/div/article/div[2]/div[1]/ul/li[1]/div/div/div/span',
    postImageBox: '//*[@id="react-root"]/section/main/div/div/article/div[1]/div/div',
    likesPath: '//*[@id="react-root"]/section/main/div/div/article/div[2]/section[2]/div',
    username: '//*[@id="react-root"]/section/main/div/div/article/header/div[2]/div[1]/div[1]/h2/a',
    mentionedHandlesContainer: '//*[@id="react-root"]/section/main/div/div/article/div[1]/div/div' // ----> ALL THE (a) ANCHORS
}

let RESPONSE_STATUS = {
    success: 200,
    private_account: 300,
    page_not_found: 404,
    something_went_wrong: 500
}

let ERRORS = {
    page_not_found: "Page Not Found",
    private_account: "User is private",
    close_model: "Close Model Xpath Error",
    post_list: "Post List Xpath Error",
    something_went_wrong: "Something Went Wrong"
}

module.exports = {
    ERRORS,
    RESPONSE_STATUS,
    XPATH_UNIQUE_POST,
    XPATH_PROFILE,
    XPATH_POSTS,
    INSTA_BASE_URL
}