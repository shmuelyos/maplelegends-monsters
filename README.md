# MapleLegends Monster Scraper

This is a web scraping tool built using Node.js, Puppeteer, and React, designed to scrape data on monsters from MapleLegends and display it in a sortable and filterable web interface.

## Installation

1. Clone the repository:
   ```
git clone https://github.com/shmuelyos/maplelegends-monsters.git
   ```

2. Navigate to the project directory:
   ```
cd maplelegends-monsters
   ```

3. Install the required dependencies:
   ```
npm install
   ```

4. Run the application:
   ```
npm start
   ```

   The app will run on [http://localhost:3000](http://localhost:3000) (or the port specified in your environment).

## Features

- Web scraping data on monsters from MapleLegends.
- Storing scraped data locally for quick access.
- Filtering monsters by level and count thresholds.
- Sorting monsters by EXP or Level.
- Displaying monster details, including name, level, EXP, HP, count, and link to the MapleLegends page.

## Usage

1. Set the `LEVEL_MIN`, `LEVEL_MAX`, and `COUNT_THRESHOLD` filters as needed.
2. Click the "Sort By EXP" or "Sort By Level" button to get the filtered and sorted list of monsters.
3. Click on the monster's name to open its MapleLegends page for more information.

## Note

This tool is intended for personal use and educational purposes only. Please respect MapleLegends' website terms of service and use this tool responsibly.
