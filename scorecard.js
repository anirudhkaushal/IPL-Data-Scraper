// const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard";

const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

function processScorecard(url) {
    request(url, cb);
}

function cb(err, response, html) {
    if(err) {
        console.log(err);
    } else {
        // console.log(html);
        extractMatchDetails(html);
    }
}

function extractMatchDetails(html) {
    let $ = cheerio.load(html);
    let matchVenueDate = $(".match-info-MATCH .description");
    let matchResultInfo = $(".match-info-MATCH .status-text");
    let matchVenueDateArray = matchVenueDate.text().split(",");
    let matchVenue = matchVenueDateArray[1].trim();
    let matchDate = matchVenueDateArray[2].trim();
    let matchResult = matchResultInfo.text();
    // console.log(matchVenue);
    // console.log(matchDate);
    // console.log(matchResult);
    let innings = $(".card.content-block.match-scorecard-table>.Collapsible");
    // let htmlString = "";
    for(let i = 0; i < innings.length; i++) {
        // htmlString += $(innings[i]).html();
        let teamName = $(innings[i]).find(".header-title.label").text();
        teamName = teamName.split("INNINGS")[0].trim();
        let opponentTeamIndex = i == 0 ? 1 : 0;
        let opponentTeamName = $(innings[opponentTeamIndex]).find(".header-title.label").text();
        opponentTeamName = opponentTeamName.split("INNINGS")[0].trim();

        console.log(`${matchVenue} ${matchDate} ${teamName} ${opponentTeamName} ${matchResult}`);

        let cInnings = $(innings[i]);

        let allRows = cInnings.find(".table.batsman tbody tr");
        for(let i = 0; i < allRows.length; i++) {
            let allCols = $(allRows[i]).find("td");
            let isWorthy = $(allCols[0]).hasClass("batsman-cell");
            if(isWorthy) {
                let playerName = $(allCols[0]).text().trim();
                let runs = $(allCols[2]).text().trim();
                let balls = $(allCols[3]).text().trim();
                let fours = $(allCols[5]).text().trim();
                let sixes = $(allCols[6]).text().trim();
                let sr = $(allCols[7]).text().trim();
                console.log(`${playerName} ${runs} ${balls} ${fours} ${sixes} ${sr}`);
                processPlayer(teamName, playerName, runs, balls, fours, sixes, sr, opponentTeamName, matchResult, matchDate, matchVenue);
            }
        }
    }
    // console.log(htmlString);

}

function processPlayer(teamName, playerName, runs, balls, fours, sixes, sr, opponentTeamName, matchResult, matchDate, matchVenue) {
    let teamFilePath = path.join(__dirname, "ipl", teamName);
    dirCreator(teamFilePath);
    let playerFilePath = path.join(teamFilePath, playerName + ".xlsx");
    let content = excelReader(playerFilePath, playerName);
    let playerObj = {
        teamName,
        playerName,
        runs,
        balls,
        fours,
        sixes,
        sr,
        opponentTeamName,
        matchResult,
        matchDate,
        matchVenue
    }
    content.push(playerObj);
    excelWriter(content, playerName, playerFilePath);
}

function dirCreator(filePath) {
    if(fs.existsSync(filePath) == false) {
        fs.mkdirSync(filePath);
    }
}

function excelWriter(jsonData, sheetName, fileName) {
    
    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(jsonData);
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    xlsx.writeFile(newWB, fileName);
}

function excelReader(fileName, sheetName) {
    if(fs.existsSync(fileName) == false) {
        return [];
    }
    let wb = xlsx.readFile(fileName);
    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}

module.exports = {
    processScorecard: processScorecard
}