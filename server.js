const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(cors());
const port = process.env.PORT || 5000;
const DATA_FILE = 'data.json';
const {init} = require('./init')

init(DATA_FILE)

function filterData(data, LEVEL_MIN, LEVEL_MAX, COUNT_THRESHOLD) {
    return data.filter(m => LEVEL_MIN <= m.level && m.level <= LEVEL_MAX && m.count >= COUNT_THRESHOLD);
}

function sortByLevel(arr) {
    return arr.sort((m1, m2) => m2.level - m1.level);
}

function sortByEXP(arr) {
    return arr.sort((m1, m2) => m2.exp - m1.exp);
}
function sortByHP(arr) {
    return arr.sort((m1, m2) => m2.hp - m1.hp);
}

app.get('/scrape', async (req, res) => {

    // Get LEVEL_MIN and LEVEL_MAX from query params
    const {LEVEL_MIN = 95, LEVEL_MAX = 95, COUNT_THRESHOLD = 1, SORT_BY = "EXP"} = req.query;

    // Handle if LEVEL_MIN or LEVEL_MAX is not provided
    if (!LEVEL_MIN || !LEVEL_MAX || !COUNT_THRESHOLD) {
        return res.status(400).send({error: 'LEVEL_MIN and LEVEL_MAX are required query parameters'});
    }


    // Check if data file exists
    if (fs.existsSync(DATA_FILE)) {
        console.log("Returning filtered data from file");
        const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(rawData);


        switch (SORT_BY) {

            case "EXP":
                const sortedByEXP = sortByEXP(data)
                res.send(filterData(data, LEVEL_MIN, LEVEL_MAX, COUNT_THRESHOLD))
                fs.writeFileSync(DATA_FILE, JSON.stringify(sortedByEXP));
                return;

            case "LEVEL":
                const sortedByLevel = sortByLevel(data)
                res.send(filterData(data, LEVEL_MIN, LEVEL_MAX, COUNT_THRESHOLD))
                fs.writeFileSync(DATA_FILE, JSON.stringify(sortedByLevel));
                return;

            case "HP":
                const sortedByHP = sortByHP(data)
                res.send(filterData(data, LEVEL_MIN, LEVEL_MAX, COUNT_THRESHOLD))
                fs.writeFileSync(DATA_FILE, JSON.stringify(sortedByHP));
                return;

            case "Reverse":
                const reversed = data.reverse()
                res.send(filterData(data, LEVEL_MIN, LEVEL_MAX, COUNT_THRESHOLD))
                fs.writeFileSync(DATA_FILE, JSON.stringify(reversed));
                return;


            default:
                return res.send(filterData(data, LEVEL_MIN, LEVEL_MAX, COUNT_THRESHOLD))
        }


    } else {
        return res.status(500).send({error: 'Data file not found'});
    }

});


app.listen(port, () => console.log(`Server listening on port ${port}!`));
