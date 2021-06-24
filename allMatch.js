const request = require("request");
const cheerio = require("cheerio");
const scorecardObj = require("./scorecard");

function getAllMatchesLink(link) {
    request(link, function(err, response, html) {
        if(err) {
            console.log(err);
        } else {
            extractAllLinks(html);
        }
    })
}
function extractAllLinks(html) {
    let $ = cheerio.load(html);
    let anchorElem = $("a[data-hover='Scorecard']");
    for(let i = 0; i < anchorElem.length; i++) {
        let link = "https://www.espncricinfo.com" + $(anchorElem[i]).attr("href");
        // console.log(link);
        scorecardObj.processScorecard(link);
    }
}

module.exports = {
    getAllMatchesLink: getAllMatchesLink
}