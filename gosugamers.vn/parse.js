const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const prefixPaginate = '?pageNo=';

const domain = 'https://www.gosugamers.vn';

const urlCategories = [
    // {
    //     'url': 'https://www.gosugamers.vn/wild-rift/articles',
    //     'slug': 'toc-chien',

    // },
    // {
    //     'url': 'https://www.gosugamers.vn/arena-of-valor/articles',
    //     'slug': 'lien-quan-mobile',

    // },
    {
        'url': 'https://www.gosugamers.vn/lol/articles',
        'slug': 'lien-minh-huyen-thoai',

    },
    // {
    //     'url': 'https://www.gosugamers.vn/valorant/articles',
    //     'slug': 'valorant',

    // },
]

class Parse {
    sleep(ms = 2000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async run() {
        console.log('Runningg.....!!!');
        let i = 0;
        do {
            const item = urlCategories[i];
            console.log(item, 'item');

            // await this.parseDataFromCategoryUrl(null, 'valorant');
            await this.parseDataFromCategoryUrl(item.url, item.slug);

            i++;
            await this.sleep(3000);
        } while (i < urlCategories.length);


        console.log('---');
        console.log('Done..!!!');
        console.log('---');
    }

    async parseDataFromCategoryUrl(categoryUrl, slug) {
        console.log('-');
        console.log('-');
        console.log('-');
        console.log('-');
        console.log('Start crawl category URL: ' + categoryUrl);
        let hasNextPage = true;
        let page = 126;
        let listNews = [];

        const regex = /https:\/\/www\.gosugamers\.vn\/([a-zA-Z\-]+)\//;
        const match = categoryUrl.match(regex);
        console.log(match[1], 'match');
        const crawlCategorySlug = match[1];

        do {
            const apiUrl = `${domain}/api/v5/articles/${crawlCategorySlug}?pageSize=20&pageNo=${page}`;

            const data = await this.getDataFromUrl(apiUrl);

            if (data && slug) {
                listNews = await this.buildListNews(slug, crawlCategorySlug, data);
            }

            console.log(listNews, 'listNews', listNews.length);
            console.log(apiUrl, 'apiUrl');

            if (listNews.length == 0) {
                console.log(`Done crawl category url: ${apiUrl}`);

                hasNextPage = false;
            } else {
                console.log('PARSE DATA');

                await this.parseData(listNews);
            }

            page++;
            await this.sleep(1000);
        } while (hasNextPage);


        return listNews;
    }

    async getDataFromUrl(apiUrl) {
        let data = null;

        if (apiUrl) {
            console.log(111, apiUrl);

            const response = await axios.get(
                apiUrl,
                {
                    "headers": {
                        "accept": "application/json, text/plain, */*",
                        "accept-language": "en-US,en;q=0.9,vi;q=0.8,ja;q=0.7,hy;q=0.6",
                        "apitoken": "sm4gHhK9uQ6QfOnQUXybbogavJdBKVOGR5HBZ2T7nhDMrOJLYo4+ghsL2Z7kGjaPfv9Cgcn0LK3dHKZdKnH+/HX4dNXoF1B/pHczhU8Xb47OLWK0yg7WJB/BnigjfFjidXLpdi7Caf7b1FKwm1+RSQ39TwSoTCojoxBXwFFo94A=",
                        "front-end-hostname": "www.gosugamers.vn",
                        "priority": "u=1, i",
                        "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"macOS\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-request-id": "ZJo/qb/H4jJYsyT7kR/fydgctpk61WdQ/r0AQwo1YiE0rXYVPzPXR/lqsdh0q6Zg0MgQ05l/Nki5FdrQQTWp1g3xxtT4bAX5z8kgVgRGPSsauooB2t7A4ZWrHnLxqDaH8C2rqDz6zF0fcsK9r/TMFcEgTbU6AWZ3cn84wYiBEt8=",
                        "cookie": "NEXT_LOCALE=vi; _ga=GA1.1.2096477517.1726117479; __Host-next-auth.csrf-token=eeaf7d9d2d83e77bf20c8027ce26009fb23843e1995b31f5e563e4d31ee94ea2%7C3b55e1fa7f0a834fd6d8a1a8ddc1518513e89d27bf67e632d60c91204a349fa8; __Secure-next-auth.callback-url=https%3A%2F%2Fwww.gosugamers.vn%2Fwild-rift%2Farticles%3FpageNo%3D5; _clck=13sxgvp%7C2%7Cfpg%7C0%7C1716; _ga_1VWVKRYMG1=GS1.1.1727142531.16.1.1727142568.0.0.0; _clsk=1wdcm0o%7C1727142569386%7C7%7C1%7Ck.clarity.ms%2Fcollect",
                        "Referer": "https://www.gosugamers.vn/lol/articles?pageNo=4",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                }

            );

            if (response?.status == 200) {
                data = response.data.data.articles;
            }
        } else {

        }

        return data;
    }

    async parseData(listItem) {
        // try {
        if (listItem.length > 0) {
            for (let index = 0; index < listItem.length; index++) {
                // await this.parseNewsDetailDataFromHtml();

                await this.parseNewsDetailDataFromHtml(listItem[index]);
                await this.sleep(3000);
            }
        }
        // } catch (error) {
        //     console.log(listItem);
        //     console.log('Has error when crawl data from url');

        // }
    }

    async buildListNews(categorySlug, crawlCategorySlug, data) {
        const listItem = [];

        for (const index in data) {
            const item = data[index];

            if (item.url.includes(crawlCategorySlug)) {
                listItem.push({
                    url: `${domain}${item.url}`,
                    avatar: item.headlineImagePath,
                    category_slug: categorySlug,
                    description: item.teaser,
                    public_date: this.formatDate(item.publishedAt),
                    news_slug: item.urlSafeTitle,
                    crawl_category: crawlCategorySlug,
                });
            }
        }

        return listItem;
    }

    async parseNewsDetailDataFromHtml(itemParse) {
        try {
            let news = null;
            let html = null;

            if (itemParse != undefined) {
                console.log('Start parse URL: ' + itemParse.url);
                console.log('-');
                console.log('-');
                const response = await axios.get(itemParse.url);

                console.log(response.status, 'status');

                if (response.status == 200) {
                    html = response.data;
                }

            } else {
                // html = await fs.readFile(__dirname + '/template-example/detail.html', 'utf8');
            }

            // itemParse = {
            //     url: domain + '/valorant/news/72805-nguoi-choi-valorant-buc-xuc-bo-game-vi-cho-rang-bi-trung-phat-qua-vo-ly',
            //     avatar: 'https://static.gosugamers.net/6e/7a/2e/5da9fa7b28f99f527877802c47e42d43b636d7cc3b5a313a12ab90ba12.webp',
            //     category_slug: 'lien-quan-mobile'
            // };


            if (html) {
                news = await this.parseDataNewsDetail(html, itemParse);


                const data = {
                    news
                }
                // console.log(JSON.stringify(data), 'data');

                await this.storeNews(data);
            }
            return news;
        } catch (error) {

            return null;
        }


    }

    async parseDataTags(html) {
        const $ = cheerio.load(html);
        let tags = [];
        const hashTag = $('.hash-tags a');

        hashTag.each((index) => {
            const item = hashTag[index];

            tags.push({
                title: $(item).text().trim(),
                slug: $(item).attr('href').replace('/', '').trim()
            })
        })

        return tags;
    }

    async storeNews(data) {
        // try {
        const response = await axios.post(
            'http://bongda.test/api/crawl/store',
            data,
        )

        console.log(response.data?.result?.message);
        console.log('.');
        console.log('.');
        console.log('.');
        // } catch (error) {
        //     console.log('ERRRORR');

        // }
    }

    async parseDataNewsDetail(html, itemParse) {
        const $ = cheerio.load(html);
        const crawlInfo = this.parseSlugFromUrl(itemParse.url);

        console.log(crawlInfo, 'crawlInfo');


        return {
            'title': $('.MuiTypography-root.MuiTypography-t3.mui-hkvvpm').text().trim(),
            'description': itemParse.description,
            'content': $('.content_page-content__K84MD.MuiBox-root.mui-0').html(),
            'slug': itemParse.news_slug,
            'avatar': itemParse.avatar,
            'pseudonym': $('.MuiStack-root.mui-q8jnap a').text(),
            'public_date': itemParse.public_date,
            'type': 1,
            'status': 2,
            'views': 0,
            'crawl_id': crawlInfo.crawl_id,
            'crawl_url': itemParse.url,
            'category_slug': itemParse.category_slug,
            'crawl_category': itemParse.crawl_category,
        }
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);

        // Lấy từng phần của ngày, tháng, năm, giờ và phút
        const day = ("0" + date.getDate()).slice(-2); // Lấy ngày (d)
        const month = ("0" + (date.getMonth() + 1)).slice(-2); // Lấy tháng (m) (lưu ý tháng tính từ 0 nên cần cộng thêm 1)
        const year = date.getFullYear(); // Lấy năm (Y)
        const hours = ("0" + date.getHours()).slice(-2); // Lấy giờ (H)
        const minutes = ("0" + date.getMinutes()).slice(-2); // Lấy phút (i)

        // Định dạng thành chuỗi d-m-Y H:i
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    parseSlugFromUrl(url) {
        const regex = /\/(\d+)-([a-zA-Z0-9-àáâãèéêìíòóôõùúýăđĩũơưẠ-ỹ-]+)\/?$/;
        let result = null;
        const match = url.match(regex);

        if (match) {
            result = {
                slug: match[2],
                crawl_id: match[1],
            }
        }

        return result;
    }
}

const parse = new Parse();

parse.run();

