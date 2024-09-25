const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const prefixPaginate = '&s_cond=&BRSR=';
const urlCategories = [

    // {
    //     'url': 'https://motgame.vn/game-mobile',
    //     'slug': 'game-mobile',
    // },
    // {
    //     'url': 'https://motgame.vn/esports/toc-chien',
    //     'slug': 'toc-chien',

    // },
    // {
    //     'url': 'https://motgame.vn/esports/lien-quan-mobile',
    //     'slug': 'lien-quan-mobile',

    // },
    {
        'url': 'https://motgame.vn/esports/lien-minh-huyen-thoai',
        'slug': 'lien-minh-huyen-thoai',
    },
    // {
    //     'url': 'https://motgame.vn/esports/valorant',
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

            // await this.getListNewsFromCategory();
            await this.parseDataFromCategoryUrl(item.url, item.slug);

            i++;
            await this.sleep(3000);
        } while (i < urlCategories.length);


        console.log('---');
        console.log('Done..!!!');
        console.log('---');
    }

    async parseDataFromCategoryUrl(url, slug) {
        console.log('Start crawl category URL: ' + url);
        let hasNextPage = true;
        let isFirstPage = true;
        let page = 37; //1771
        let listNews = [];
        let newUrl = url ?? null;

        do {

            if (!isFirstPage) {
                let pagePaginate = null;
                if (page < 10) {
                    pagePaginate = `${page}${page}`;
                } else {
                    pagePaginate = page * 11;
                }

                newUrl = `${url}${prefixPaginate}${pagePaginate}`;
            } else {
                isFirstPage = false;
            }


            const html = await this.getHtmlFromUrl(newUrl);

            if (html && slug) {
                listNews = await this.buildListNews(slug, html);
            }

            console.log(newUrl, 'newUrl');
            console.log(listNews, 'listNews');
            if (listNews.length == 0) {
                console.log(`Done crawl category url: ${newUrl}`);

                hasNextPage = false;
            } else {
                console.log('PARSE DATA');

                await this.parseData(listNews);
            }

            page++;
            await this.sleep(3000);
        } while (hasNextPage);


        return listNews;
    }

    async getHtmlFromUrl(newUrl) {
        let html = null;

        if (newUrl) {
            const response = await axios.get(newUrl);

            if (response?.status == 200) {
                html = response.data;
            }
        } else {
            html = await fs.readFile(__dirname + '/template-example/toc-chien.html', 'utf8');
        }

        return html;
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
        //     console.log('Has error when parse data from url');
        // }
    }

    async buildListNews(categorySlug, html) {
        const listItem = [];
        const $ = cheerio.load(html);
        const categoryCover = $('.motgame-category-cover .motgame-cat-content .article');
        const posts = $('.motgame-post .motgame-cat-content .article');

        categoryCover.each(index => {
            const item = categoryCover[index];
            const link = $(item).find('.article-image').attr('href') ?? null;
            if (link) {
                listItem.push({
                    url: link,
                    avatar: $(item).find('.article-image').find('img').attr('src'),
                    category_slug: categorySlug,
                });
            }
        });

        posts.each(index => {
            const item = posts[index];
            const link = $(item).find('.article-image').attr('href') ?? null;
            if (link) {
                listItem.push({
                    url: link,
                    avatar: $(item).find('.article-image').find('img').attr('src'),
                    category_slug: categorySlug,
                });
            }
        });

        return listItem;
    }

    async parseNewsDetailDataFromHtml(itemParse) {
        let news = null;
        let html = null;

        if (itemParse != undefined) {
            console.log('Start parse URL: ' + itemParse.url);

            const response = await axios.get(itemParse.url);
            html = response.data;
        } else {
            html = await fs.readFile(__dirname + '/template-example/detail.html', 'utf8');
        }

        // itemParse = {
        //     url: 'https://motgame.vn/co-1-boss-trong-black-myth-wukong-khien-tuyen-thu-em-che-bat-luc-34385.html',
        //     avatar: 'https://motgame.vn/stores/news_dataimages/2024/092024/10/13/croped/medium/tuyen-thu-em-che-bo-tay-bat-luc-voi-boss-trong-black-myth-wukong-suot-3-gio-20240910134457.jpg?240910030729',
        //     category_slug: 'toc-chien'
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
        const hashTag = $('.motgame-detail-hashtag .tag-link');

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
            // console.log(JSON.stringify(data), 'data');

            const response = await axios.post(
                'http://bongda.test/api/crawl/store',
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
            // console.log(error, 111);
        }
    }

    async parseDataNewsDetail(html, itemParse) {
        const $ = cheerio.load(html);
        const crawlInfo = this.parseSlugFromUrl(itemParse.url);
        const htmlCategory = $('.article-meta.motgame-detail-meta a').attr('href');
        const match = htmlCategory.match(/\/([^\/]+)$/)
        const crawlCategory = match ? match[1] : null;

        return {
            'title': $('.article-detail-title').text().trim(),
            'description': $('.motgame-detail-desc').text(),
            'content': $('.motgame-detail-body').html(),
            'slug': crawlInfo.slug,
            'avatar': itemParse.avatar,
            'pseudonym': $('.motgame-author-meta a').text(),
            'public_date': $('.article-meta.motgame-detail-meta .format_time').text(),
            'type': 1,
            'status': 2,
            'views': 0,
            'crawl_id': crawlInfo.crawl_id,
            'crawl_url': itemParse.url,
            'category_slug': itemParse.category_slug,
            'crawl_category': crawlCategory,
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

