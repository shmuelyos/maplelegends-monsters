const init = async (DATA_FILE) => {
    const fs = require("fs");
    const puppeteer = require("puppeteer");

    const browser = await puppeteer.launch({args: ['--disable-web-security']});
    const page = await browser.newPage();

    const items = await page.evaluate(async () => {
        const totalNumberOfPages = 131;
        const allData = [];
        let monstersMap = {};

        async function getMonsterCountFromPage(url) {
            let response = await window.fetch(url);
            let htmlString = await response.text();

            let parser = new DOMParser();
            let doc = parser.parseFromString(htmlString, 'text/html');
            let countCell = doc.querySelector('table.text-center.table-bordered tr:nth-child(2) td:nth-child(2)');
            return countCell?.textContent ? Number(countCell.textContent.trim()) : 0;
        }

        function sortByEXP(arr) {
            return arr.sort((m1, m2) => m2.exp - m1.exp);
        }

        function extractData(htmlString) {
            let parser = new DOMParser();
            let doc = parser.parseFromString(htmlString, 'text/html');
            let table = doc.querySelectorAll('table')[2];
            let rows = table.querySelectorAll('tr');
            let baseUrl = 'https://maplelegends.com';

            for (let i = 1; i < rows.length; i++) {
                let cols = rows[i].querySelectorAll('td');

                if (cols.length < 5 || !("textContent" in cols[1])) continue;

                let monsterId = parseInt(cols[1].querySelector('a').getAttribute('href').split('=')[1]);
                let monster = {
                    id: monsterId,
                    name: cols[1].textContent.trim(),
                    level: Number(cols[2].textContent.trim()),
                    exp: Number(cols[3].textContent.trim()),
                    hp: Number(cols[4].textContent.trim()),
                    url: baseUrl + cols[1].querySelector('a').getAttribute('href') + '&tab=2',
                    imageUrl: `${baseUrl}/static/images/lib/monster/${monsterId}.png`
                };

                if (!monstersMap[monsterId]) {
                    monstersMap[monsterId] = true;
                    allData.push(monster);
                }
                console.log(`Extracted: ${monster.name}`);
            }
        }

        async function fetchAndParsePage(pageNumber) {
            try {
                let url = new URL(`https://maplelegends.com/lib/monster`);
                url.searchParams.append('page', pageNumber);
                url.searchParams.append('filter', '2');
                url.searchParams.append('order', '2');
                url.searchParams.append('sort', '1');

                console.log(`Fetching page: ${pageNumber}`);
                let response = await window.fetch(url);
                let htmlString = await response.text();
                extractData(htmlString);
            } catch (error) {
                console.error(`Error fetching page ${pageNumber}:`, error);
            }
        }

        async function fetchAllPages() {
            for (let i = 1; i <= totalNumberOfPages; i++) {
                await fetchAndParsePage(i);
            }
            return allData;
        }

        return fetchAllPages().then(async data => {
            let mobPromises = data.map(async mob => {
                mob['count'] = await getMonsterCountFromPage(mob.url);
                return mob;
            });

            let mobs = await Promise.all(mobPromises);

            return sortByEXP(mobs)

        });
    });

    await browser.close();
    fs.writeFileSync(DATA_FILE, JSON.stringify(items));
}

module.exports = {init}
