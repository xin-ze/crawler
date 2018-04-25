const puppeteer = require("puppeteer");
const {mn} = require("./config/default");
const srcToImg = require("./helper/srcToImg");

const screenSize = {
    width: 1920,
    height: 1080
};
const puppeteerDefaultOptions = {
    headless: false
    // devtools: false,
    // args: [
    //     `--window-size=${screenSize.width},${screenSize.height}`,
    // ],
};

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    try {
        await page.goto('https://image.baidu.com/');
    } catch (error) {
        console.log(error);
        browser.close();
    }
    console.log('go to https://image.baidu.com/');
    
    
    await page.setViewport(screenSize);
    console.log('reset viewport');
    
    await page.focus("#kw");
    await page.keyboard.sendCharacter("狗");
    console.log('--before click--');
    
    await page.click('.s_search');
    console.log('go to search list');

    page.on("load", async () => {
        console.log('page load done, start fetch...');
        
        const srcs = await page.evaluate(() => {
            const images = document.querySelectorAll("img.main_img");
            return Array.prototype.map.call(images, image => image.src);

        })
        console.log(`get ${srcs.length} images, start download`);

        srcs.forEach(async (src) => {
            // sleep ：低频 避免 出发反爬虫逻辑
            await page.waitFor(200);
            srcToImg(src, mn);
        });

        await browser.close();
    })
    

})().catch(err => console.error(err));