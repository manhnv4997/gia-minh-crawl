const axios = require('axios');
const cheerio = require('cheerio');
const baseUrl = 'https://bongdaplus.vn';
const fs = require('fs').promises;

const listLinkCategory = [
    // 'https://bongdaplus.vn/esports',
    'https://bongdaplus.vn/loadviewmore/1/84/1',
    'https://bongdaplus.vn/loadviewmore/1/84/2',
    'https://bongdaplus.vn/loadviewmore/1/84/3',
    'https://bongdaplus.vn/loadviewmore/1/84/4',
    'https://bongdaplus.vn/loadviewmore/1/84/5',
    'https://bongdaplus.vn/loadviewmore/1/84/6',
    'https://bongdaplus.vn/loadviewmore/1/84/7',
    'https://bongdaplus.vn/loadviewmore/1/84/8',
    'https://bongdaplus.vn/loadviewmore/1/84/9',
    'https://bongdaplus.vn/loadviewmore/1/84/10',
];



class Parse {
    sleep(ms = 2000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async run() {
        // console.log('Runningg.....!!!');
        // let i = 0;
        // do {
        //     const url = listLinkCategory[i];

        //     await this.getListNewsFromUrl(url);
        //     // parse.getListNewsFromUrl();
        //     i++;
        //     await this.sleep(3000);
        // } while (i + 1 < listLinkCategory.length);


        console.log('---');
        console.log('---');
        console.log('---');
        console.log('---');
        console.log('---');
        console.log('---');
        console.log('Done..!!!');
        console.log('---');
    }

    async getListNewsFromUrl(url) {
        try {
            console.log('Start crawl category URL: ' + url);

            let html = null;
            if (url) {
                const response = await axios.get(url);
                html = response.data;
            } else {
                html = await fs.readFile(__dirname + '/template-example/list.html', 'utf8');
            }

            const listItem = [];

            if (html) {
                const $ = cheerio.load(html);


                $('.news').each(index => {
                    const thumb = $($('.news')[index]).find('.thumb');
                    if (thumb.html()) {
                        const prefix = $(thumb).attr('href');
                        if (prefix) {
                            listItem.push({
                                url: `${baseUrl}${prefix}`,
                                avatar: encodeURI($($(thumb).find('img')).attr('src'))
                            });
                        }
                    }

                });

                console.log('Total item: ' + listItem.length);
                if (listItem.length > 0) {
                    for (let index = 0; index < listItem.length; index++) {
                        // this.parseNewsDetailDataFromHtml();
                        await this.parseNewsDetailDataFromHtml(listItem[index]);
                        await this.sleep(3000);
                    }
                }
            }
        } catch (error) {
            console.log('Has error when crawl data from url');
        }
    }

    async parseNewsDetailDataFromHtml(itemParse) {
        let news = null;
        let html = null;

        if (itemParse) {
            console.log('Start parse URL: ' + itemParse.url);

            const response = await axios.get(itemParse.url);
            html = response.data;
        } else {
            console.log(2222);
            html = await fs.readFile(__dirname + '/template-example/detail.html', 'utf8');
        }

        // itemParse = {
        //     url: 'https://bongdaplus.vn/olympic/lich-thi-dau-ngay-7-8-cua-doan-viet-nam-tai-olympic-2024-cho-luc-si-trinh-van-vinh-4402602408.html',
        //     avatar: 'https://cdn.bongdaplus.vn/assets/Media/2024/08/07/37/Vinh%20Vinh%2003.jpg'
        // }


        if (html) {
            news = await this.parseDataNewsDetail(html, itemParse);
            const tags = await this.parseDataTags(html);

            const data = {
                news,
                tags
            }

            await this.storeNews(data);
        }

        return news;
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
        try {

            const response = await axios.post(
                'http://bongda.test/api/store-news-crawl',
                data,
            )

            console.log('.');
            console.log('.');
            console.log('.');
            console.log(response.data?.result?.message);
            console.log('.');
            console.log('.');
            console.log('.');
        } catch (error) {
            console.log(error, 111);
        }
    }

    async parseDataNewsDetail(html, itemParse) {
        const $ = cheerio.load(html);
        const crawlInfo = this.parseSlugFromUrl(itemParse.url);
        $('.emobar .rgt a').remove();

        return {
            'title': $('.lead-title').text().trim(),
            'description': $('.summary.bdr').text().trim(),
            'content': $('.content').html(),
            'slug': crawlInfo.slug,
            'avatar': itemParse.avatar,
            'pseudonym': $('.author').text().trim(),
            'public_date': this.formatDate(),
            'type': 1,
            'status': 2,
            'views': 0,
            'public_date': $('.emobar .rgt').html().trim().replace(/•/g, '').trim(),
            'crawl_id': crawlInfo.crawl_id,
        }
    }

    formatDate(date) {
        var d = date ? new Date(date) : new Date(),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }

    parseSlugFromUrl(url) {

        const regex = /([^/]+?)-(\d+)\.html$/;
        let result = null;

        const match = url.match(regex);
        if (match) {
            result = {
                slug: match[1],
                crawl_id: match[2],
            }
        }

        return result;
    }
}

const parse = new Parse();

parse.run();
