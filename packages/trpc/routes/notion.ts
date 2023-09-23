import { publicProcedure, router } from "../server/trpc";
import { Client } from '@notionhq/client';

export const notionRouter = router({
    createPage: publicProcedure
        // .input()
        .mutation(async ({ input, ctx }) => {

            const notion = new Client({ auth: 'secret_yYsjvRT9LMEZCFEMdFY3g8A84SDd5rCTyGr17ARMI1p' });

                const response = await notion.pages.create({
                    "cover": {
                        "type": "external",
                        "external": {
                            "url": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
                        }
                    },
                    "icon": {
                        "type": "emoji",
                        "emoji": "🥬"
                    },
                    "parent": {
                        "type": "database_id",
                        "database_id": "d9824bdc-8445-4327-be8b-5b47500af6ce"
                    },
                    "properties": {
                        "Name": {
                            "title": [
                                {
                                    "text": {
                                        "content": "Tuscan kale"
                                    }
                                }
                            ]
                        },
                        "Description": {
                            "rich_text": [
                                {
                                    "text": {
                                        "content": "A dark green leafy vegetable"
                                    }
                                }
                            ]
                        },
                        "Food group": {
                            "select": {
                                "name": "🥬 Vegetable"
                            }
                        }
                    },
                    "children": [
                        {
                            "object": "block",
                            "heading_2": {
                                "rich_text": [
                                    {
                                        "text": {
                                            "content": "Lacinato kale"
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "object": "block",
                            "paragraph": {
                                "rich_text": [
                                    {
                                        "text": {
                                            "content": "Lacinato kale is a variety of kale with a long tradition in Italian cuisine, especially that of Tuscany. It is also known as Tuscan kale, Italian kale, dinosaur kale, kale, flat back kale, palm tree kale, or black Tuscan palm.",
                                            "link": {
                                                "url": "https://en.wikipedia.org/wiki/Lacinato_kale"
                                            }
                                        },
                                        //@ts-ignore
                                        "href": "https://en.wikipedia.org/wiki/Lacinato_kale"
                                    }
                                ],
                                "color": "default"
                            }
                        }
                    ]
                });
                console.log(response);
        })
})