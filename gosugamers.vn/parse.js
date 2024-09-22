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
    // {
    //     'url': 'https://www.gosugamers.vn/lol/articles',
    //     'slug': 'lien-minh-huyen-thoai',

    // },
    {
        'url': 'https://www.gosugamers.vn/valorant/articles',
        'slug': 'valorant',

    },
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
        let page = 1;
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
                        "apitoken": "aFkMVYCQBSVauedCb317WfVZZGg64Q7oODtEolG4tGarf3gkcdF8W1FLgwCu5GQ3/tTYu/wy67SjXtU3MZrA1M8HInJzYYrWYIeU+LfFGmiM19BnGp/w6cupTy5byCnA/gVAjgWOeYBaPM5cxrFWgN7UGPBMjeISOGwkjEpTlOc=",
                        "front-end-hostname": "www.gosugamers.vn",
                        "priority": "u=1, i",
                        "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"macOS\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-request-id": "XLJbLvvAar9vl6XklOrX+vfDgwAxQZC9I0xsEpWIZrpFvOlimKo1sONzow5ViaY6KOxE5RXFapqGuV3V4RHizw4l0yZLncsutdOTaIIXLUw6FZCTJtd0Q7cYWr8F2xGQxCEoGoUmOjdOxmJ6zcH/YBc9I2+ExnMUt4j65t/sHBo=",
                        "cookie": "NEXT_LOCALE=vi; _ga=GA1.1.2096477517.1726117479; __Host-next-auth.csrf-token=eeaf7d9d2d83e77bf20c8027ce26009fb23843e1995b31f5e563e4d31ee94ea2%7C3b55e1fa7f0a834fd6d8a1a8ddc1518513e89d27bf67e632d60c91204a349fa8; __Secure-next-auth.callback-url=https%3A%2F%2Fwww.gosugamers.vn%2Fwild-rift%2Farticles%3FpageNo%3D5; _clck=13sxgvp%7C2%7Cfpe%7C0%7C1716; _ga_1VWVKRYMG1=GS1.1.1726996163.12.1.1726996204.0.0.0; _clsk=ank6xz%7C1726996204567%7C2%7C1%7Cq.clarity.ms%2Fcollect",
                        "Referer": "https://www.gosugamers.vn/valorant/articles?pageNo=2",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                }

            );


            if (response?.status == 200) {
                data = response.data.data.articles;
            }
        } else {
            // console.log(2221);
            // const response = {
            //     "ret": 0,
            //     "msg": "Success",
            //     "traceId": "71b152e6b44937369d773b6e9cfea5b7",
            //     "data": {
            //         "articles": [
            //             {
            //                 "id": 72805,
            //                 "frontendId": 3,
            //                 "type": 1,
            //                 "typeName": "News",
            //                 "urlSafeType": "news",
            //                 "title": "Người chơi VALORANT bức xúc bỏ game vì cho rằng bị trừng phạt quá vô lý",
            //                 "urlSafeTitle": "nguoi-choi-valorant-buc-xuc-bo-game-vi-cho-rang-bi-trung-phat-qua-vo-ly",
            //                 "sectionIds": [
            //                     21
            //                 ],
            //                 "displaySectionId": 21,
            //                 "displaySectionUrlSafeName": "valorant",
            //                 "publishedAt": 1724695200000,
            //                 "headlineImagePath": "https://static.gosugamers.net/6e/7a/2e/5da9fa7b28f99f527877802c47e42d43b636d7cc3b5a313a12ab90ba12.webp",
            //                 "headlineImageText": "Người chơi VALORANT bức xúc bỏ game vì cho rằng bị trừng phạt quá vô lý",
            //                 "squareHeadlineImageUrl": null,
            //                 "teaser": "Game thủ VALORANT này đã tuyên bố bỏ game sau khi bị trừng phạt một cách vô lý bởi hệ thống thanh trừng của Riot Games.",
            //                 "url": "/valorant/news/72805-nguoi-choi-valorant-buc-xuc-bo-game-vi-cho-rang-bi-trung-phat-qua-vo-ly"
            //             },
            //             {
            //                 "id": 72790,
            //                 "frontendId": 3,
            //                 "type": 1,
            //                 "typeName": "News",
            //                 "urlSafeType": "news",
            //                 "title": "Chiêm ngưỡng nhan sắc cô nàng Jett xinh đẹp hút hồn biết bao fan VALORANT",
            //                 "urlSafeTitle": "chiem-nguong-nhan-sac-co-nang-jett-xinh-dep-hut-hon-biet-bao-fan-valorant",
            //                 "sectionIds": [
            //                     21,
            //                     25
            //                 ],
            //                 "displaySectionId": 11,
            //                 "displaySectionUrlSafeName": "general",
            //                 "publishedAt": 1724641200000,
            //                 "headlineImagePath": "https://static.gosugamers.net/3c/85/59/1d55c48efb61b284725a08c411828e127ab8becf347cb235fd8874e960.webp",
            //                 "headlineImageText": "Chiêm ngưỡng nhan sắc cô nàng Jett xinh đẹp hút hồn biết bao fan VALORANT",
            //                 "squareHeadlineImageUrl": null,
            //                 "teaser": "Cosplayer xinh đẹp này đã thu hút sự quan tâm của khá nhiều fan VALORANT nhờ vào màn hóa thân thành Jett của mình.",
            //                 "url": "/news/72790-chiem-nguong-nhan-sac-co-nang-jett-xinh-dep-hut-hon-biet-bao-fan-valorant"
            //             },
            //             {
            //                 "id": 72783,
            //                 "frontendId": 3,
            //                 "type": 1,
            //                 "typeName": "News",
            //                 "urlSafeType": "news",
            //                 "title": "Đánh bại TH, EDG lên ngôi vô địch VALORANT Champions 2024",
            //                 "urlSafeTitle": "danh-bai-th-edg-len-ngoi-vo-dich-valorant-champions-2024",
            //                 "sectionIds": [
            //                     21
            //                 ],
            //                 "displaySectionId": 21,
            //                 "displaySectionUrlSafeName": "valorant",
            //                 "publishedAt": 1724608800000,
            //                 "headlineImagePath": "https://static.gosugamers.net/1a/35/b0/5b72e80d31bc12d186905bc000c635daa0d4bffac388e831fcf4462e71.webp",
            //                 "headlineImageText": "Đánh bại TH, EDG lên ngôi vô địch VALORANT Champions 2024",
            //                 "squareHeadlineImageUrl": null,
            //                 "teaser": "Với chiến thắng đầy gian nan tại Hàn Quốc, EDG đã khiến nhiều fan vỡ òa khi nâng cúp vô địch VALORANT Champions 2024.",
            //                 "url": "/valorant/news/72783-danh-bai-th-edg-len-ngoi-vo-dich-valorant-champions-2024"
            //             },
            //             {
            //                 "id": 72774,
            //                 "frontendId": 3,
            //                 "type": 1,
            //                 "typeName": "News",
            //                 "urlSafeType": "news",
            //                 "title": "Hé lộ loạt skin Nocturnum với hiệu ứng “thợ săn tiền thưởng” độc đáo trong VALORANT",
            //                 "urlSafeTitle": "he-lo-loat-skin-nocturnum-voi-hieu-ung-tho-san-tien-thuong-doc-dao-trong-valorant",
            //                 "sectionIds": [
            //                     21
            //                 ],
            //                 "displaySectionId": 21,
            //                 "displaySectionUrlSafeName": "valorant",
            //                 "publishedAt": 1724536800000,
            //                 "headlineImagePath": "https://static.gosugamers.net/0a/e3/18/a00dde63a6b3d7b9b53e6246da8b69b2ce9b3cb9670b518f6473b7a076.webp",
            //                 "headlineImageText": "Hé lộ loạt skin Nocturnum với hiệu ứng “thợ săn tiền thưởng” độc đáo trong VALORANT",
            //                 "squareHeadlineImageUrl": null,
            //                 "teaser": "Loạt skin chất lượng mang tên Nocturnum hứa hẹn sẽ khiến cho cộng đồng VALORANT “hiến máu” nhiệt tình trong thời gian sắp tới.",
            //                 "url": "/valorant/news/72774-he-lo-loat-skin-nocturnum-voi-hieu-ung-tho-san-tien-thuong-doc-dao-trong-valorant"
            //             },
            //             {
            //                 "id": 72768,
            //                 "frontendId": 3,
            //                 "type": 1,
            //                 "typeName": "News",
            //                 "urlSafeType": "news",
            //                 "title": " EDG tạo nên lịch sử cho Valorant Trung Quốc",
            //                 "urlSafeTitle": "edg-tao-nen-lich-su-cho-valorant-trung-quoc",
            //                 "sectionIds": [
            //                     21
            //                 ],
            //                 "displaySectionId": 21,
            //                 "displaySectionUrlSafeName": "valorant",
            //                 "publishedAt": 1724472000000,
            //                 "headlineImagePath": "https://static.gosugamers.net/f4/04/e5/b4f89dd02494aa29c65413947fce20f089ca081641a4ddff45d18efe61.webp",
            //                 "headlineImageText": " EDG tạo nên lịch sử cho Valorant Trung Quốc",
            //                 "squareHeadlineImageUrl": null,
            //                 "teaser": "Trong một ngày thi đấu thăng hoa, KangKang và đồng đội đã tạo nên kỳ tích mới cho nền Valorant xứ Trung.",
            //                 "url": "/valorant/news/72768-edg-tao-nen-lich-su-cho-valorant-trung-quoc"
            //             },
            //             {
            //                 "id": 72751,
            //                 "frontendId": 3,
            //                 "type": 1,
            //                 "typeName": "News",
            //                 "urlSafeType": "news",
            //                 "title": "VYSE - Đặc Vụ mới nhất của VALORANT có diện mạo và kỹ năng thế nào?",
            //                 "urlSafeTitle": "vyse-dac-vu-moi-nhat-cua-valorant-co-dien-mao-the-nao",
            //                 "sectionIds": [
            //                     21
            //                 ],
            //                 "displaySectionId": 21,
            //                 "displaySectionUrlSafeName": "valorant",
            //                 "publishedAt": 1724392800000,
            //                 "headlineImagePath": "https://static.gosugamers.net/96/f2/c2/a16420668e5ce41f86bc8f3ee5e8424a35d198c1ef4be24ef39c8230fb.webp",
            //                 "headlineImageText": "VYSE - Đặc Vụ mới nhất của VALORANT có diện mạo và kỹ năng thế nào?",
            //                 "squareHeadlineImageUrl": null,
            //                 "teaser": "Đặc Vụ thứ 26 của VALORANT đã rò rỉ chiêu cuối cũng như gương mặt có phần “máy móc” của mình.",
            //                 "url": "/valorant/news/72751-vyse-dac-vu-moi-nhat-cua-valorant-co-dien-mao-the-nao"
            //             },
            //             {
            //                 "id": 72732,
            //                 "frontendId": 3,
            //                 "type": 1,
            //                 "typeName": "News",
            //                 "urlSafeType": "news",
            //                 "title": "Nhà vô địch Valorant gây thất vọng nhất 2024 bất ngờ tái hợp với Cloud9",
            //                 "urlSafeTitle": "cuu-vuong-valorant-gay-that-vong-nhat-2024-gay-bat-ngo-khi-tai-hop-voi-cloud9",
            //                 "sectionIds": [
            //                     21
            //                 ],
            //                 "displaySectionId": 21,
            //                 "displaySectionUrlSafeName": "valorant",
            //                 "publishedAt": 1724292000000,
            //                 "headlineImagePath": "https://static.gosugamers.net/21/04/91/0a682febe101d86af4c6ceb9402ee6e8606662c09cdbdd3e2ae7b14bef.webp",
            //                 "headlineImageText": "Nhà vô địch Valorant gây thất vọng nhất 2024 bất ngờ tái hợp với Cloud9",
            //                 "squareHeadlineImageUrl": null,
            //                 "teaser": "Sau một năm gây thất vọng vì màn trình diễn dưới sức tại VCT Pacific 2024, Yay đang bí mật trở lại quê nhà để gây dựng nên đế chế mới.",
            //                 "url": "/valorant/news/72732-cuu-vuong-valorant-gay-that-vong-nhat-2024-gay-bat-ngo-khi-tai-hop-voi-cloud9"
            //             },
            //             {
            //                 "id": 72708,
            //                 "frontendId": 3,
            //                 "type": 1,
            //                 "typeName": "News",
            //                 "urlSafeType": "news",
            //                 "title": "VALORANT Champions 2024 tại Seoul trở thành sự kiện thành công nhất lịch sử VALORANT",
            //                 "urlSafeTitle": "valorant-champions-2024-tai-seoul-tro-thanh-su-kien-thanh-cong-nhat-lich-su-valorant",
            //                 "sectionIds": [
            //                     21
            //                 ],
            //                 "displaySectionId": 21,
            //                 "displaySectionUrlSafeName": "valorant",
            //                 "publishedAt": 1724205600000,
            //                 "headlineImagePath": "https://static.gosugamers.net/03/2e/1c/81d6e071a13baa71737495bc940b866c92f5acf7ca28fdc7dc753970a8.webp",
            //                 "headlineImageText": "VALORANT Champions 2024 tại Seoul trở thành sự kiện thành công nhất lịch sử VALORANT",
            //                 "squareHeadlineImageUrl": null,
            //                 "teaser": "Với việc tạo ra kỷ lục chưa từng có về lượt xem trong lịch sử VALORANT, giải đấu quốc tế tại Seoul đã đánh dấu một cột mốc mới cho tựa game FPS nhà Riot Games.",
            //                 "url": "/valorant/news/72708-valorant-champions-2024-tai-seoul-tro-thanh-su-kien-thanh-cong-nhat-lich-su-valorant"
            //             },
            //             {
            //                 "id": 72704,
            //                 "frontendId": 3,
            //                 "type": 1,
            //                 "typeName": "News",
            //                 "urlSafeType": "news",
            //                 "title": "Valorant tung hint mới về đặc vụ thứ 26 của tựa game",
            //                 "urlSafeTitle": "valorant-tung-hint-moi-ve-dac-vu-thu-26-cua-tua-game",
            //                 "sectionIds": [
            //                     21
            //                 ],
            //                 "displaySectionId": 21,
            //                 "displaySectionUrlSafeName": "valorant",
            //                 "publishedAt": 1724184000000,
            //                 "headlineImagePath": "https://static.gosugamers.net/fc/08/27/6fbf13894ebc0d80c91affcb0d50b2c3c343c618e7726009cddacd1996.webp",
            //                 "headlineImageText": "Valorant tung hint mới về đặc vụ thứ 26 của tựa game",
            //                 "squareHeadlineImageUrl": null,
            //                 "teaser": "Đặc vụ mới nhất của Valorant đang là tâm điểm chú ý của cộng đồng sau khi thông tin của cô được Riot tung teaser tiếp theo trong đêm qua. ",
            //                 "url": "/valorant/news/72704-valorant-tung-hint-moi-ve-dac-vu-thu-26-cua-tua-game"
            //             },
            //             {
            //                 "id": 72703,
            //                 "frontendId": 3,
            //                 "type": 1,
            //                 "typeName": "News",
            //                 "urlSafeType": "news",
            //                 "title": "Riot gây bất ngờ tại buổi họp báo trước Chung Kết VCT Champions Seoul 2024",
            //                 "urlSafeTitle": "riot-gay-bat-ngo-tai-buoi-hop-bao-truoc-chung-ket-vct-champions-seoul-2024",
            //                 "sectionIds": [
            //                     21
            //                 ],
            //                 "displaySectionId": 21,
            //                 "displaySectionUrlSafeName": "valorant",
            //                 "publishedAt": 1724176800000,
            //                 "headlineImagePath": "https://static.gosugamers.net/7c/45/35/fe34e4aa917d53c0ef755b7ccb61e9e67ef3d634c38c520355cbfe57b7.webp",
            //                 "headlineImageText": "Riot gây bất ngờ tại buổi họp báo trước Chung Kết VCT Champions Seoul 2024",
            //                 "squareHeadlineImageUrl": null,
            //                 "teaser": "Riot Games đã quyết định một hướng đi lâu dài cho Valorant và thể hiện cho quyết tâm đó thông qua việc công bố lộ trình giải đấu cho 3 năm tới. ",
            //                 "url": "/valorant/news/72703-riot-gay-bat-ngo-tai-buoi-hop-bao-truoc-chung-ket-vct-champions-seoul-2024"
            //             },
            //             {
            //                 "id": 72684,
            //                 "frontendId": 3,
            //                 "type": 1,
            //                 "typeName": "News",
            //                 "urlSafeType": "news",
            //                 "title": "Tuyển thủ Sentinels được ông chủ thưởng đậm sau một năm cày ải mệt mỏi",
            //                 "urlSafeTitle": "tuyen-thu-sentinels-duoc-ong-chu-thuong-dam-sau-mot-nam-cay-ai-met-moi",
            //                 "sectionIds": [
            //                     21
            //                 ],
            //                 "displaySectionId": 21,
            //                 "displaySectionUrlSafeName": "valorant",
            //                 "publishedAt": 1724130000000,
            //                 "headlineImagePath": "https://static.gosugamers.net/7b/7c/19/a54973d5169256eaf233b291cc493126790bbcaaeec12be94f9b3b0b5b.webp",
            //                 "headlineImageText": "Tuyển thủ Sentinels được ông chủ thưởng đậm sau một năm cày ải mệt mỏi",
            //                 "squareHeadlineImageUrl": null,
            //                 "teaser": "Zellsis đang có một năm vô cùng thành công với vai trò tuyển thủ chủ lực lẫn “trưởng phòng marketing” của đội tuyển đông fan nhất nhì Valorant.",
            //                 "url": "/valorant/news/72684-tuyen-thu-sentinels-duoc-ong-chu-thuong-dam-sau-mot-nam-cay-ai-met-moi"
            //             },
            //             {
            //                 "id": 72677,
            //                 "frontendId": 3,
            //                 "type": 1,
            //                 "typeName": "News",
            //                 "urlSafeType": "news",
            //                 "title": "Vợ Tenz xin lỗi fan Trung Quốc vì phát ngôn bôi nhọ trên stream",
            //                 "urlSafeTitle": "vo-tenz-xin-loi-fan-trung-quoc-vi-phat-ngon-boi-nho-tren-stream",
            //                 "sectionIds": [
            //                     21
            //                 ],
            //                 "displaySectionId": 21,
            //                 "displaySectionUrlSafeName": "valorant",
            //                 "publishedAt": 1724097600000,
            //                 "headlineImagePath": "https://static.gosugamers.net/13/b3/49/978951e49bc3aef3c06fec7509f261c6a1c0426bfcf46b683887f53945.webp",
            //                 "headlineImageText": "Vợ Tenz xin lỗi fan Trung Quốc vì phát ngôn bôi nhọ trên stream",
            //                 "squareHeadlineImageUrl": null,
            //                 "teaser": "Nữ streamer Kyedae mới đây đã dính vào tranh cãi về chính phát ngôn của cô trong một buổi stream.",
            //                 "url": "/valorant/news/72677-vo-tenz-xin-loi-fan-trung-quoc-vi-phat-ngon-boi-nho-tren-stream"
            //             }
            //         ],
            //         "paging": {
            //             "pageNo": 2,
            //             "pageSize": 12,
            //             "totalPages": 44,
            //             "totalRows": 525
            //         }
            //     }
            // };
            // data = response.data.articles;
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
                    news_slug: item.urlSafeTitle
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
        try {
            const response = await axios.post(
                'http://bongda.test/api/store-news-crawl',
                data,
            )

            console.log(response.data?.result?.message);
            console.log('.');
            console.log('.');
            console.log('.');
        } catch (error) {
            console.log(JSON.stringify(data));
            console.log(111);

        }
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

