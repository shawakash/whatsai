import express from "express"
import { Client } from '@notionhq/client';
import { getDatabaseId, getPageId, uuid } from "../lib/helper";
import { createDbRequest } from "types";

const router = express.Router();


router.get('/getDb', async (req, res) => {
    try {
        const { api_key, database_url } = req.headers;

        const notion = new Client({ auth: api_key as string });
        const response = await notion.databases.retrieve({ database_id: getDatabaseId(database_url as string) });


        console.log(response);
        if (response.id) {
            return res.status(200).json(response);
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Error', error });
    }
});

router.post('/createDb', async (req, res) => {
    try {

        // const parsedRequest = createDbRequest.safeParse(req.body);
        // if (!parsedRequest.success) {
        //     throw new Error(`Validation Error, ${parsedRequest.error}`);
        // }

        const { api_key, page_url } = req.body;

        const notion = new Client({ auth: api_key });
        let page_id = getPageId(page_url);
        console.log(page_id, 'fro here')
        if(getPageId(page_url) == '') {
            page_id = uuid;
        }

        const response = await notion.databases.create({
            parent: {
                type: "page_id",
                page_id,
              },
            icon: {
                type: "emoji",
                emoji: "📝",
            },
            cover: {
                type: "external",
                external: {
                    url: "https://website.domain/images/image.png",
                },
            },
            title: [
                {
                    type: "text",
                    text: {
                        content: "Grocery List",
                        link: null,
                    },
                },
            ],
            properties: {
                Name: {
                    title: {},
                },
                Description: {
                    rich_text: {},
                },
                "In stock": {
                    checkbox: {},
                },
                "Food group": {
                    select: {
                        options: [
                            {
                                name: "🥦Vegetable",
                                color: "green",
                            },
                            {
                                name: "🍎Fruit",
                                color: "red",
                            },
                            {
                                name: "💪Protein",
                                color: "yellow",
                            },
                        ],
                    },
                },
                Price: {
                    number: {
                        format: "dollar",
                    },
                },
                "Last ordered": {
                    date: {},
                },
                "Store availability": {
                    type: "multi_select",
                    multi_select: {
                        options: [
                            {
                                name: "Duc Loi Market",
                                color: "blue",
                            },
                            {
                                name: "Rainbow Grocery",
                                color: "gray",
                            },
                            {
                                name: "Nijiya Market",
                                color: "purple",
                            },
                            {
                                name: "Gus'''s Community Market",
                                color: "yellow",
                            },
                        ],
                    },
                },
                "+1": {
                    people: {},
                },
                Photo: {
                    files: {},
                },
            },
        });

        console.log(response);
        if(response.id) {
            return res.status(200).json(response);
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Error', error })
    }
});

export default router;