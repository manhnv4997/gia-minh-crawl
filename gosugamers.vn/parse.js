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

const urlCategoryVideos = [
    // {
    //     'url': 'https://www.gosugamers.vn/wild-rift/vods',
    //     'slug': 'video',
    // },
    // {
    //     'url': 'https://www.gosugamers.vn/arena-of-valor/vods',
    //     'slug': 'video',
    // },
    // {
    //     'url': 'https://www.gosugamers.vn/lol/vods',
    //     'slug': 'video',
    // },
    {
        'url': 'https://www.gosugamers.vn/valorant/vods',
        'slug': 'video',
    },
]

class Parse {
    sleep(ms = 2000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async run() {
        console.log('Runningg.....!!!');

        // await this.crawlNews();

        await this.crawlVideo();
    }

    async crawlVideo() {
        console.log('Runningg crawl video .....!!!');
        let i = 0;
        do {
            const item = urlCategoryVideos[i];

            await this.getDataFromApiVideo(item.url, item.slug);

            i++;
            console.log('crawlVideo');

            await this.sleep(500);
        } while (i < urlCategories.length);


        console.log('---');
        console.log('Done crawl news..!!!');
        console.log('---');
    }

    async crawlNews() {
        console.log('Runningg.....!!!');
        let i = 0;
        do {
            const item = urlCategories[i];
            console.log(item, 'item');

            await this.getDataFromApiVideo(item.url, item.slug);

            i++;
            await this.sleep(3000);
        } while (i < urlCategories.length);


        console.log('---');
        console.log('Done crawl news..!!!');
        console.log('---');
    }

    async getDataFromApiVideo(categoryUrl, slug) {
        let page = 1;
        let hasNextPage = true;

        do {
            const match = categoryUrl.match(/(?<=https:\/\/www\.gosugamers\.vn\/)[^\/]+/);
            const categoryCrawlSlug = match ? match[0] : null;

            const apiUrl = `${domain}/api/v5/vods?siteSectionName=${categoryCrawlSlug}&onlyFirstGame=false&pageNo=${page}&pageSize=20`

            console.log(apiUrl, '-- API');

            const data = await this.getDataFromUrl(apiUrl, 'vods');

            // const data = [
            //     {
            //         "id": 541655,
            //         "title": "BSS vs TDT - Arena of Glory Winter 2024 - R2 G2",
            //         "urlSafeTitle": "bss-vs-tdt-arena-of-glory-winter-2024-r2-g2",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/541655.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "j1gvGXHhQWo",
            //         "channelName": null,
            //         "createdAt": 1726842481000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591270-the-daredevil-team-vs-black-sarus-esports",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591270,
            //             "matchUrlSafeName": "the-daredevil-team-vs-black-sarus-esports",
            //             "matchNumber": 2,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 2,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 46180,
            //                     "registeredId": 683523,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "TDT",
            //                     "opponentFullName": "The Daredevil Team",
            //                     "opponentUrlSafeName": "the-daredevil-team",
            //                     "imageUrl": "https://static.gosugamers.net/51/bd/23/8e788d3384c76b2f63de7d8496074eaf23e28820d7f8d5d9940287a06b.webp",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 47906,
            //                     "registeredId": 683525,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "BSS",
            //                     "opponentFullName": "Black Sarus Esports",
            //                     "opponentUrlSafeName": "black-sarus-esports",
            //                     "imageUrl": null,
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 541654,
            //         "title": "BSS vs TDT - Arena of Glory Winter 2024 - R2 G1",
            //         "urlSafeTitle": "bss-vs-tdt-arena-of-glory-winter-2024-r2-g1",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/541654.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "j1gvGXHhQWo",
            //         "channelName": null,
            //         "createdAt": 1726842469000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591270-the-daredevil-team-vs-black-sarus-esports",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591270,
            //             "matchUrlSafeName": "the-daredevil-team-vs-black-sarus-esports",
            //             "matchNumber": 1,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 1,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 46180,
            //                     "registeredId": 683523,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "TDT",
            //                     "opponentFullName": "The Daredevil Team",
            //                     "opponentUrlSafeName": "the-daredevil-team",
            //                     "imageUrl": "https://static.gosugamers.net/51/bd/23/8e788d3384c76b2f63de7d8496074eaf23e28820d7f8d5d9940287a06b.webp",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 47906,
            //                     "registeredId": 683525,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "BSS",
            //                     "opponentFullName": "Black Sarus Esports",
            //                     "opponentUrlSafeName": "black-sarus-esports",
            //                     "imageUrl": null,
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 541046,
            //         "title": "SGP vs One Star - Arena of Glory Winter 2024 - Game 4",
            //         "urlSafeTitle": "sgp-vs-one-star-arena-of-glory-winter-2024-game-4",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/541046.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "-FGlPAfcDLU",
            //         "channelName": null,
            //         "createdAt": 1726454092000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591251-saigon-phantom-vs-one-star-esports",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591251,
            //             "matchUrlSafeName": "saigon-phantom-vs-one-star-esports",
            //             "matchNumber": 4,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 4,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 42963,
            //                     "registeredId": 683519,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "SGP",
            //                     "opponentFullName": "Saigon Phantom",
            //                     "opponentUrlSafeName": "saigon-phantom",
            //                     "imageUrl": "https://static.gosugamers.net/a7/96/63/94d5071c4924e958da540bd40e1a75f5fe2afa3a620cc7dd9c0acb8759.png",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 52565,
            //                     "registeredId": 683520,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "1S",
            //                     "opponentFullName": "One Star Esports",
            //                     "opponentUrlSafeName": "one-star-esports",
            //                     "imageUrl": "https://static.gosugamers.net/aa/6a/56/882e6cf612adfcf43f436cae0e9c4a74c6fcce6c7a136eb4b3f16319e4.webp",
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 541045,
            //         "title": "SGP vs One Star - Arena of Glory Winter 2024 - Game 3",
            //         "urlSafeTitle": "sgp-vs-one-star-arena-of-glory-winter-2024-game-3",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/541045.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "-FGlPAfcDLU",
            //         "channelName": null,
            //         "createdAt": 1726454079000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591251-saigon-phantom-vs-one-star-esports",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591251,
            //             "matchUrlSafeName": "saigon-phantom-vs-one-star-esports",
            //             "matchNumber": 3,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 3,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 42963,
            //                     "registeredId": 683519,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "SGP",
            //                     "opponentFullName": "Saigon Phantom",
            //                     "opponentUrlSafeName": "saigon-phantom",
            //                     "imageUrl": "https://static.gosugamers.net/a7/96/63/94d5071c4924e958da540bd40e1a75f5fe2afa3a620cc7dd9c0acb8759.png",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 52565,
            //                     "registeredId": 683520,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "1S",
            //                     "opponentFullName": "One Star Esports",
            //                     "opponentUrlSafeName": "one-star-esports",
            //                     "imageUrl": "https://static.gosugamers.net/aa/6a/56/882e6cf612adfcf43f436cae0e9c4a74c6fcce6c7a136eb4b3f16319e4.webp",
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 541044,
            //         "title": "SGP vs One Star - Arena of Glory Winter 2024 - Game 2",
            //         "urlSafeTitle": "sgp-vs-one-star-arena-of-glory-winter-2024-game-2",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/541044.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "-FGlPAfcDLU",
            //         "channelName": null,
            //         "createdAt": 1726454064000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591251-saigon-phantom-vs-one-star-esports",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591251,
            //             "matchUrlSafeName": "saigon-phantom-vs-one-star-esports",
            //             "matchNumber": 2,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 2,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 42963,
            //                     "registeredId": 683519,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "SGP",
            //                     "opponentFullName": "Saigon Phantom",
            //                     "opponentUrlSafeName": "saigon-phantom",
            //                     "imageUrl": "https://static.gosugamers.net/a7/96/63/94d5071c4924e958da540bd40e1a75f5fe2afa3a620cc7dd9c0acb8759.png",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 52565,
            //                     "registeredId": 683520,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "1S",
            //                     "opponentFullName": "One Star Esports",
            //                     "opponentUrlSafeName": "one-star-esports",
            //                     "imageUrl": "https://static.gosugamers.net/aa/6a/56/882e6cf612adfcf43f436cae0e9c4a74c6fcce6c7a136eb4b3f16319e4.webp",
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 541043,
            //         "title": "SGP vs One Star - Arena of Glory Winter 2024 - Game 1",
            //         "urlSafeTitle": "sgp-vs-one-star-arena-of-glory-winter-2024-game-1",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/541043.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "-FGlPAfcDLU",
            //         "channelName": null,
            //         "createdAt": 1726454051000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591251-saigon-phantom-vs-one-star-esports",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591251,
            //             "matchUrlSafeName": "saigon-phantom-vs-one-star-esports",
            //             "matchNumber": 1,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 1,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 42963,
            //                     "registeredId": 683519,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "SGP",
            //                     "opponentFullName": "Saigon Phantom",
            //                     "opponentUrlSafeName": "saigon-phantom",
            //                     "imageUrl": "https://static.gosugamers.net/a7/96/63/94d5071c4924e958da540bd40e1a75f5fe2afa3a620cc7dd9c0acb8759.png",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 52565,
            //                     "registeredId": 683520,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "1S",
            //                     "opponentFullName": "One Star Esports",
            //                     "opponentUrlSafeName": "one-star-esports",
            //                     "imageUrl": "https://static.gosugamers.net/aa/6a/56/882e6cf612adfcf43f436cae0e9c4a74c6fcce6c7a136eb4b3f16319e4.webp",
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 541042,
            //         "title": "TDT vs TF - Arena of Glory Winter 2024 - Game 5",
            //         "urlSafeTitle": "tdt-vs-tf-arena-of-glory-winter-2024-game-5",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/541042.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "-FGlPAfcDLU",
            //         "channelName": null,
            //         "createdAt": 1726454021000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591272-the-daredevil-team-vs-team-flash",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591272,
            //             "matchUrlSafeName": "the-daredevil-team-vs-team-flash",
            //             "matchNumber": 5,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 5,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 46180,
            //                     "registeredId": 683523,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "TDT",
            //                     "opponentFullName": "The Daredevil Team",
            //                     "opponentUrlSafeName": "the-daredevil-team",
            //                     "imageUrl": "https://static.gosugamers.net/51/bd/23/8e788d3384c76b2f63de7d8496074eaf23e28820d7f8d5d9940287a06b.webp",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 42965,
            //                     "registeredId": 683527,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "FL",
            //                     "opponentFullName": "Team Flash",
            //                     "opponentUrlSafeName": "team-flash",
            //                     "imageUrl": "https://static.gosugamers.net/ee/2e/b0/535e099bf5492942e22438b4c80315edd7f737a1619b0ce7c083ba1a66.png",
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 541041,
            //         "title": "TDT vs TF - Arena of Glory Winter 2024 - Game 4",
            //         "urlSafeTitle": "tdt-vs-tf-arena-of-glory-winter-2024-game-4",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/541041.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "-FGlPAfcDLU",
            //         "channelName": null,
            //         "createdAt": 1726454008000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591272-the-daredevil-team-vs-team-flash",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591272,
            //             "matchUrlSafeName": "the-daredevil-team-vs-team-flash",
            //             "matchNumber": 4,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 4,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 46180,
            //                     "registeredId": 683523,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "TDT",
            //                     "opponentFullName": "The Daredevil Team",
            //                     "opponentUrlSafeName": "the-daredevil-team",
            //                     "imageUrl": "https://static.gosugamers.net/51/bd/23/8e788d3384c76b2f63de7d8496074eaf23e28820d7f8d5d9940287a06b.webp",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 42965,
            //                     "registeredId": 683527,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "FL",
            //                     "opponentFullName": "Team Flash",
            //                     "opponentUrlSafeName": "team-flash",
            //                     "imageUrl": "https://static.gosugamers.net/ee/2e/b0/535e099bf5492942e22438b4c80315edd7f737a1619b0ce7c083ba1a66.png",
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 541040,
            //         "title": "TDT vs TF - Arena of Glory Winter 2024 - Game 3",
            //         "urlSafeTitle": "tdt-vs-tf-arena-of-glory-winter-2024-game-3",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/541040.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "-FGlPAfcDLU",
            //         "channelName": null,
            //         "createdAt": 1726453995000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591272-the-daredevil-team-vs-team-flash",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591272,
            //             "matchUrlSafeName": "the-daredevil-team-vs-team-flash",
            //             "matchNumber": 3,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 3,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 46180,
            //                     "registeredId": 683523,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "TDT",
            //                     "opponentFullName": "The Daredevil Team",
            //                     "opponentUrlSafeName": "the-daredevil-team",
            //                     "imageUrl": "https://static.gosugamers.net/51/bd/23/8e788d3384c76b2f63de7d8496074eaf23e28820d7f8d5d9940287a06b.webp",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 42965,
            //                     "registeredId": 683527,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "FL",
            //                     "opponentFullName": "Team Flash",
            //                     "opponentUrlSafeName": "team-flash",
            //                     "imageUrl": "https://static.gosugamers.net/ee/2e/b0/535e099bf5492942e22438b4c80315edd7f737a1619b0ce7c083ba1a66.png",
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 541039,
            //         "title": "TDT vs TF - Arena of Glory Winter 2024 - Game 2",
            //         "urlSafeTitle": "tdt-vs-tf-arena-of-glory-winter-2024-game-2",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/541039.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "-FGlPAfcDLU",
            //         "channelName": null,
            //         "createdAt": 1726453982000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591272-the-daredevil-team-vs-team-flash",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591272,
            //             "matchUrlSafeName": "the-daredevil-team-vs-team-flash",
            //             "matchNumber": 2,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 2,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 46180,
            //                     "registeredId": 683523,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "TDT",
            //                     "opponentFullName": "The Daredevil Team",
            //                     "opponentUrlSafeName": "the-daredevil-team",
            //                     "imageUrl": "https://static.gosugamers.net/51/bd/23/8e788d3384c76b2f63de7d8496074eaf23e28820d7f8d5d9940287a06b.webp",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 42965,
            //                     "registeredId": 683527,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "FL",
            //                     "opponentFullName": "Team Flash",
            //                     "opponentUrlSafeName": "team-flash",
            //                     "imageUrl": "https://static.gosugamers.net/ee/2e/b0/535e099bf5492942e22438b4c80315edd7f737a1619b0ce7c083ba1a66.png",
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 541038,
            //         "title": "TDT vs TF - Arena of Glory Winter 2024 - Game 1",
            //         "urlSafeTitle": "tdt-vs-tf-arena-of-glory-winter-2024-game-1",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/541038.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "-FGlPAfcDLU",
            //         "channelName": null,
            //         "createdAt": 1726453969000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591272-the-daredevil-team-vs-team-flash",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591272,
            //             "matchUrlSafeName": "the-daredevil-team-vs-team-flash",
            //             "matchNumber": 1,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 1,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 46180,
            //                     "registeredId": 683523,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "TDT",
            //                     "opponentFullName": "The Daredevil Team",
            //                     "opponentUrlSafeName": "the-daredevil-team",
            //                     "imageUrl": "https://static.gosugamers.net/51/bd/23/8e788d3384c76b2f63de7d8496074eaf23e28820d7f8d5d9940287a06b.webp",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 42965,
            //                     "registeredId": 683527,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "FL",
            //                     "opponentFullName": "Team Flash",
            //                     "opponentUrlSafeName": "team-flash",
            //                     "imageUrl": "https://static.gosugamers.net/ee/2e/b0/535e099bf5492942e22438b4c80315edd7f737a1619b0ce7c083ba1a66.png",
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 541037,
            //         "title": "SH vs BS - Arena of Glory Winter 2024 - Game 4",
            //         "urlSafeTitle": "sh-vs-bs-arena-of-glory-winter-2024-game-4",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/541037.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "-FGlPAfcDLU",
            //         "channelName": null,
            //         "createdAt": 1726453921000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591273-super-heavy-vs-black-sarus-esports",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591273,
            //             "matchUrlSafeName": "super-heavy-vs-black-sarus-esports",
            //             "matchNumber": 4,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 4,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 54185,
            //                     "registeredId": 683524,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "Heavy",
            //                     "opponentFullName": "Super Heavy",
            //                     "opponentUrlSafeName": "super-heavy",
            //                     "imageUrl": null,
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 47906,
            //                     "registeredId": 683525,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "BSS",
            //                     "opponentFullName": "Black Sarus Esports",
            //                     "opponentUrlSafeName": "black-sarus-esports",
            //                     "imageUrl": null,
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 541036,
            //         "title": "SH vs BS - Arena of Glory Winter 2024 - Game 3",
            //         "urlSafeTitle": "sh-vs-bs-arena-of-glory-winter-2024-game-3",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/541036.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "-FGlPAfcDLU",
            //         "channelName": null,
            //         "createdAt": 1726453899000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591273-super-heavy-vs-black-sarus-esports",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591273,
            //             "matchUrlSafeName": "super-heavy-vs-black-sarus-esports",
            //             "matchNumber": 3,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 3,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 54185,
            //                     "registeredId": 683524,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "Heavy",
            //                     "opponentFullName": "Super Heavy",
            //                     "opponentUrlSafeName": "super-heavy",
            //                     "imageUrl": null,
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 47906,
            //                     "registeredId": 683525,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "BSS",
            //                     "opponentFullName": "Black Sarus Esports",
            //                     "opponentUrlSafeName": "black-sarus-esports",
            //                     "imageUrl": null,
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 541035,
            //         "title": "SH vs BS - Arena of Glory Winter 2024 - Game 2",
            //         "urlSafeTitle": "sh-vs-bs-arena-of-glory-winter-2024-game-2",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/541035.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "-FGlPAfcDLU",
            //         "channelName": null,
            //         "createdAt": 1726453886000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591273-super-heavy-vs-black-sarus-esports",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591273,
            //             "matchUrlSafeName": "super-heavy-vs-black-sarus-esports",
            //             "matchNumber": 2,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 2,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 54185,
            //                     "registeredId": 683524,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "Heavy",
            //                     "opponentFullName": "Super Heavy",
            //                     "opponentUrlSafeName": "super-heavy",
            //                     "imageUrl": null,
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 47906,
            //                     "registeredId": 683525,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "BSS",
            //                     "opponentFullName": "Black Sarus Esports",
            //                     "opponentUrlSafeName": "black-sarus-esports",
            //                     "imageUrl": null,
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 541034,
            //         "title": "SH vs BS - Arena of Glory Winter 2024 - Game 1",
            //         "urlSafeTitle": "sh-vs-bs-arena-of-glory-winter-2024-game-1",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/541034.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "-FGlPAfcDLU",
            //         "channelName": null,
            //         "createdAt": 1726453872000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591273-super-heavy-vs-black-sarus-esports",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591273,
            //             "matchUrlSafeName": "super-heavy-vs-black-sarus-esports",
            //             "matchNumber": 1,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 1,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 54185,
            //                     "registeredId": 683524,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "Heavy",
            //                     "opponentFullName": "Super Heavy",
            //                     "opponentUrlSafeName": "super-heavy",
            //                     "imageUrl": null,
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 47906,
            //                     "registeredId": 683525,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "BSS",
            //                     "opponentFullName": "Black Sarus Esports",
            //                     "opponentUrlSafeName": "black-sarus-esports",
            //                     "imageUrl": null,
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 540853,
            //         "title": "OSE vs BOX - Arena of Glory Winter 2024 - Game 5",
            //         "urlSafeTitle": "ose-vs-box-arena-of-glory-winter-2024-game-5",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/540853.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "5G3K7Pj5ywc",
            //         "channelName": null,
            //         "createdAt": 1726378166000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591258-one-star-esports-vs-box-gaming",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591258,
            //             "matchUrlSafeName": "one-star-esports-vs-box-gaming",
            //             "matchNumber": 5,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 5,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 52565,
            //                     "registeredId": 683520,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "1S",
            //                     "opponentFullName": "One Star Esports",
            //                     "opponentUrlSafeName": "one-star-esports",
            //                     "imageUrl": "https://static.gosugamers.net/aa/6a/56/882e6cf612adfcf43f436cae0e9c4a74c6fcce6c7a136eb4b3f16319e4.webp",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 42964,
            //                     "registeredId": 683521,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "Box Gaming",
            //                     "opponentFullName": "Box Gaming",
            //                     "opponentUrlSafeName": "box-gaming",
            //                     "imageUrl": "https://static.gosugamers.net/fd/20/8d/f5a03c72ede4fa8e43734f86b4e5d5aa70b2b12c205cf3bbacca51d7c4.webp",
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 540852,
            //         "title": "OSE vs BOX - Arena of Glory Winter 2024 - Game 4",
            //         "urlSafeTitle": "ose-vs-box-arena-of-glory-winter-2024-game-4",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/540852.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "5G3K7Pj5ywc",
            //         "channelName": null,
            //         "createdAt": 1726378152000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591258-one-star-esports-vs-box-gaming",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591258,
            //             "matchUrlSafeName": "one-star-esports-vs-box-gaming",
            //             "matchNumber": 4,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 4,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 52565,
            //                     "registeredId": 683520,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "1S",
            //                     "opponentFullName": "One Star Esports",
            //                     "opponentUrlSafeName": "one-star-esports",
            //                     "imageUrl": "https://static.gosugamers.net/aa/6a/56/882e6cf612adfcf43f436cae0e9c4a74c6fcce6c7a136eb4b3f16319e4.webp",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 42964,
            //                     "registeredId": 683521,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "Box Gaming",
            //                     "opponentFullName": "Box Gaming",
            //                     "opponentUrlSafeName": "box-gaming",
            //                     "imageUrl": "https://static.gosugamers.net/fd/20/8d/f5a03c72ede4fa8e43734f86b4e5d5aa70b2b12c205cf3bbacca51d7c4.webp",
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 540851,
            //         "title": "OSE vs BOX - Arena of Glory Winter 2024 - Game 3",
            //         "urlSafeTitle": "ose-vs-box-arena-of-glory-winter-2024-game-3",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/540851.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "5G3K7Pj5ywc",
            //         "channelName": null,
            //         "createdAt": 1726378137000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591258-one-star-esports-vs-box-gaming",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591258,
            //             "matchUrlSafeName": "one-star-esports-vs-box-gaming",
            //             "matchNumber": 3,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 3,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 52565,
            //                     "registeredId": 683520,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "1S",
            //                     "opponentFullName": "One Star Esports",
            //                     "opponentUrlSafeName": "one-star-esports",
            //                     "imageUrl": "https://static.gosugamers.net/aa/6a/56/882e6cf612adfcf43f436cae0e9c4a74c6fcce6c7a136eb4b3f16319e4.webp",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 42964,
            //                     "registeredId": 683521,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "Box Gaming",
            //                     "opponentFullName": "Box Gaming",
            //                     "opponentUrlSafeName": "box-gaming",
            //                     "imageUrl": "https://static.gosugamers.net/fd/20/8d/f5a03c72ede4fa8e43734f86b4e5d5aa70b2b12c205cf3bbacca51d7c4.webp",
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 540850,
            //         "title": "OSE vs BOX - Arena of Glory Winter 2024 - Game 2",
            //         "urlSafeTitle": "ose-vs-box-arena-of-glory-winter-2024-game-2",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/540850.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "5G3K7Pj5ywc",
            //         "channelName": null,
            //         "createdAt": 1726378123000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591258-one-star-esports-vs-box-gaming",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591258,
            //             "matchUrlSafeName": "one-star-esports-vs-box-gaming",
            //             "matchNumber": 2,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 2,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 52565,
            //                     "registeredId": 683520,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "1S",
            //                     "opponentFullName": "One Star Esports",
            //                     "opponentUrlSafeName": "one-star-esports",
            //                     "imageUrl": "https://static.gosugamers.net/aa/6a/56/882e6cf612adfcf43f436cae0e9c4a74c6fcce6c7a136eb4b3f16319e4.webp",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 42964,
            //                     "registeredId": 683521,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "Box Gaming",
            //                     "opponentFullName": "Box Gaming",
            //                     "opponentUrlSafeName": "box-gaming",
            //                     "imageUrl": "https://static.gosugamers.net/fd/20/8d/f5a03c72ede4fa8e43734f86b4e5d5aa70b2b12c205cf3bbacca51d7c4.webp",
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     },
            //     {
            //         "id": 540849,
            //         "title": "OSE vs BOX - Arena of Glory Winter 2024 - Game 1",
            //         "urlSafeTitle": "ose-vs-box-arena-of-glory-winter-2024-game-1",
            //         "description": null,
            //         "screenCapUrl": "https://static.gosugamers.net/media/vods/540849.webp",
            //         "host": 0,
            //         "hostName": "Youtube",
            //         "hostVideoId": "5G3K7Pj5ywc",
            //         "channelName": null,
            //         "createdAt": 1726378105000,
            //         "displaySectionId": 24,
            //         "siteSectionUrlSafeName": null,
            //         "sectionIds": [
            //             24
            //         ],
            //         "startTime": 0,
            //         "url": "/arena-of-valor/tournaments/61158-arena-of-glory-winter-2024/matches/591258-one-star-esports-vs-box-gaming",
            //         "match": {
            //             "parentId": 61158,
            //             "parentName": "Arena of Glory Winter 2024",
            //             "parentUrlSafeName": "arena-of-glory-winter-2024",
            //             "parentGameId": 24,
            //             "stageName": "Main Event",
            //             "childName": "Stage 1",
            //             "childType": 1,
            //             "childTypeName": "Group",
            //             "matchId": 591258,
            //             "matchUrlSafeName": "one-star-esports-vs-box-gaming",
            //             "matchNumber": 1,
            //             "roundNumber": 2,
            //             "roundName": "Round 2",
            //             "matchGameId": null,
            //             "gameNumber": 1,
            //             "result": null,
            //             "opponents": [
            //                 {
            //                     "sourceId": 52565,
            //                     "registeredId": 683520,
            //                     "opponentPlacement": 1,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "1S",
            //                     "opponentFullName": "One Star Esports",
            //                     "opponentUrlSafeName": "one-star-esports",
            //                     "imageUrl": "https://static.gosugamers.net/aa/6a/56/882e6cf612adfcf43f436cae0e9c4a74c6fcce6c7a136eb4b3f16319e4.webp",
            //                     "score": null
            //                 },
            //                 {
            //                     "sourceId": 42964,
            //                     "registeredId": 683521,
            //                     "opponentPlacement": 2,
            //                     "opponentType": 1,
            //                     "opponentTypeName": "Team",
            //                     "opponentName": "Box Gaming",
            //                     "opponentFullName": "Box Gaming",
            //                     "opponentUrlSafeName": "box-gaming",
            //                     "imageUrl": "https://static.gosugamers.net/fd/20/8d/f5a03c72ede4fa8e43734f86b4e5d5aa70b2b12c205cf3bbacca51d7c4.webp",
            //                     "score": null
            //                 }
            //             ]
            //         }
            //     }
            // ];

            const listItem = await this.buildDataVideo(slug, categoryCrawlSlug, data);

            if (listItem.length > 0) {
                await this.handleStoreVideo(listItem)
            } else {
                hasNextPage = false;
            }

            page++
            await this.sleep(3000);
        } while (hasNextPage);
    }

    async handleStoreVideo(listItem) {
        let i = 0

        console.log(listItem, 111);
        do {
            const news = listItem[i];
            const data = {
                news
            }

            await this.storeNews(data)

            await this.sleep(1000);
            i++
        } while (i < listItem.length);
    }

    async buildDataVideo(categorySlug, crawlCategorySlug, dataResponse) {
        const listItem = [];

        dataResponse.forEach(item => {
            listItem.push({
                title: item.title,
                slug: item.urlSafeTitle,
                crawl_url: `${domain}/${crawlCategorySlug}/vods/${item.id}-${item.urlSafeTitle}`,// https://www.gosugamers.vn/arena-of-valor/vods/542238-sgp-vs-sh-arena-of-glory-winter-2024-gs-1-g4
                avatar: item.screenCapUrl,
                category_slug: categorySlug,
                content: `<iframe id="video" src="https://www.youtube.com/embed/${item.hostVideoId}?autoplay=0&amp;mute=0&amp;start=0&controls=1&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3" style="border: none; width: 100%; height: 100%;" allow="clipboard-write"></iframe>`,
                public_date: this.formatDate(item.createdAt),
                crawl_category: crawlCategorySlug,
                crawl_id: item.id,
                is_video: 1,
                type: 1,
                status: 2,
                views: 0,
            });
        })

        return listItem;
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

    async getDataFromUrl(apiUrl, keyDataResponse = 'articles') {
        let data = null;

        if (apiUrl) {
            console.log(111, apiUrl);

            const response = await axios.get(
                apiUrl,
                {
                    "headers": {
                        "accept": "application/json, text/plain, */*",
                        "accept-language": "en-US,en;q=0.9,vi;q=0.8,ja;q=0.7,hy;q=0.6",
                        "apitoken": "ElkoP7eNu8JiWD5BDwoj8wr0/JAE9NGcCRmqr3o6mj5EbivdWAZuHaaTBj27kUj3dNbujHa1AW1RU+ZwdW70bDIv7KX4Ac7EfgVBTtWh3dah7AM0TyAcVr6btguclKGoYKqFvz+CdhAu+ua50BlCumVuXBF+1EGxDdKjiBH3zBY=",
                        "front-end-hostname": "www.gosugamers.vn",
                        "priority": "u=1, i",
                        "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"macOS\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-request-id": "E48zrdcZD8jZl8aUPzJMsRLqpp0bnFMBJd1Mx8tnK4H0SNjJuTvo37PcRzUYY+VZvAqunqknvFns4kFRmzLBeZOh1VormvL9spUVnyEoCW7WjzE/Hi35/kmubLcJATuzbPXrQtGvU/iMe9yECxm8ED71KyqYAH4T0wKKxd6r+w8=",
                        "cookie": "NEXT_LOCALE=vi; _ga=GA1.1.2096477517.1726117479; __Host-next-auth.csrf-token=eeaf7d9d2d83e77bf20c8027ce26009fb23843e1995b31f5e563e4d31ee94ea2%7C3b55e1fa7f0a834fd6d8a1a8ddc1518513e89d27bf67e632d60c91204a349fa8; __Secure-next-auth.callback-url=https%3A%2F%2Fwww.gosugamers.vn%2Fwild-rift%2Farticles%3FpageNo%3D5; _clck=13sxgvp%7C2%7Cfph%7C0%7C1716; _ga_1VWVKRYMG1=GS1.1.1727231572.19.1.1727233899.0.0.0; _clsk=1lofl14%7C1727233899164%7C17%7C1%7Ck.clarity.ms%2Fcollect",
                        "Referer": "https://www.gosugamers.vn/arena-of-valor/vods?pageNo=2",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                }

            );

            if (response?.status == 200) {
                data = response.data.data[keyDataResponse];
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
                    slug: item.urlSafeTitle,
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
        //     console.log('ERRRORR store news');

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

