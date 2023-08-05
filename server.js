const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
app.use(cors());

const port = process.env.PORT || 5000;

app.get('/scrape', async (req, res) => {
    // Get LEVEL_MIN and LEVEL_MAX from query params
    const {LEVEL_MIN = 40, LEVEL_MAX = 50, COUNT_THRESHOLD = 20} = req.query;

    // Handle if LEVEL_MIN or LEVEL_MAX is not provided
    if (!LEVEL_MIN || !LEVEL_MAX || !COUNT_THRESHOLD) {
        return res.status(400).send({error: 'LEVEL_MIN and LEVEL_MAX are required query parameters'});
    }

    const browser = await puppeteer.launch({args: ['--disable-web-security']});
    const page = await browser.newPage();


    const items = await page.evaluate(async (LEVEL_MIN, LEVEL_MAX, COUNT_THRESHOLD) => {

        // Constants
        const BATCH_SIZE = 90;
        const allData = [];

        // Function to extract monster data from an HTML string
        function extractData(htmlString) {
            let parser = new DOMParser();
            let doc = parser.parseFromString(htmlString, 'text/html');
            let table = doc.querySelectorAll('table')[2];
            let rows = table.querySelectorAll('tr');
            let baseUrl = 'https://maplelegends.com';

            // Iterate over each row in the table
            for (let i = 1; i < rows.length; i++) {
                let cols = rows[i].querySelectorAll('td');

                // Skip rows that don't have enough columns
                if (cols.length < 5 || !("textContent" in cols[1])) continue;

                // Create a dictionary for each monster
                let monster = {
                    name: cols[1].textContent.trim(),
                    level: Number(cols[2].textContent.trim()),
                    exp: Number(cols[3].textContent.trim()),
                    hp: Number(cols[4].textContent.trim()),
                    url: baseUrl + cols[1].querySelector('a').getAttribute('href') + '&tab=2'
                };

                allData.push(monster);
            }
        }

// Function to fetch and parse a page
        async function fetchAndParsePage(pageNumber) {
            try {
                let url = new URL(`https://maplelegends.com/lib/monster`);
                url.searchParams.append('page', pageNumber);
                url.searchParams.append('filter', '2');
                url.searchParams.append('order', '3');
                url.searchParams.append('sort', '2');

                let response = await window.fetch(url);
                let htmlString = await response.text();

                extractData(htmlString);
            } catch (error) {
                console.error(`Error fetching page ${pageNumber}:`, error);
            }
        }

// Function to fetch and parse a monster's page and return its count
        async function fetchAndParseMonsterPage(url) {
            let response = await window.fetch(url);
            let htmlString = await response.text();

            let parser = new DOMParser();
            let doc = parser.parseFromString(htmlString, 'text/html');
            let countCell = doc.querySelector('table.text-center.table-bordered tr:nth-child(2) td:nth-child(2)');
            return countCell?.textContent ? Number(countCell.textContent.trim()) : 0;
        }

// Fetch and parse all pages
        async function fetchAllPages() {
            let pagePromises = [];

            // Create a promise for each page fetch and parsing operation
            for (let i = 1; i <= 90; i++) {
                pagePromises.push(fetchAndParsePage(i));

                if (pagePromises.length === BATCH_SIZE || i === 90) {
                    await Promise.all(pagePromises);
                    pagePromises = [];
                }
            }

            return allData;
        }

        function sortByEXP(arr) {
            return arr.sort((m1, m2) => m2.exp - m1.exp);
        }

        // Start fetching all pages and process the data
        return fetchAllPages().then(async data => {
            let mobsInRange = data.filter(m => LEVEL_MIN <= m.level && m.level <= LEVEL_MAX);

            // Filter out monsters with a count less than COUNT_THRESHOLD
            let mobPromises = mobsInRange.map(async mob => {
                let count = await fetchAndParseMonsterPage(mob.url);
                if (count >= COUNT_THRESHOLD) {
                    mob['count'] = count;
                    return mob;
                }
            });

            let filteredMobsInRange = await Promise.all(mobPromises);
            filteredMobsInRange = filteredMobsInRange.filter(mob => mob !== undefined);

            let sortedData = sortByEXP(filteredMobsInRange);
            let filteredData = [];
            sortedData.forEach(d => filteredData.push(d));
            console.log(filteredData);
            return filteredData;
        });

    }, LEVEL_MIN, LEVEL_MAX, COUNT_THRESHOLD);

    await browser.close();

    res.send(items);
});


app.listen(port, () => console.log(`Server listening on port ${port}!`));
