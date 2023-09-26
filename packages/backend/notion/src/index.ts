import express from "express";
const app = express();
import { Client } from '@notionhq/client';
import { createPageRequest } from 'types';
import dotenv from "dotenv";
import { getDatabaseId } from "./lib/helper";
import bodyParser from 'body-parser';
import dbRouter from './routes/database';
dotenv.config();

const {
    PORT,
    NOTION_API_KEY
} = process.env;


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use('/db', dbRouter);

app.post('/createPage', async (req, res) => {
    const parsedRequest = createPageRequest.safeParse(req.body);
    if(!parsedRequest.success) {
        throw Error(`Validation Error, ${parsedRequest.error}`);
    }
    
    const { database_url, api_key } = parsedRequest.data;
    const database_id = getDatabaseId(database_url);
    // console.log(database_url)
    
    const notion = new Client({ auth: api_key });
    const response = await notion.pages.create({
        "cover": {
            "type": "external",
            "external": {
                "url": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
            }
        },
        "icon": {
            "type": "emoji",
            "emoji": "🐳"
        },
        "parent": {
            "type": "database_id",
            "database_id": database_id
        },
        "properties": {
            "Name": {
                "title": [
                    {
                        "text": {
                            "content": "Docker"
                        }
                    }
                ]
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

    if(response.id) {
        return res.status(200).json(response)
    }
});

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT} ...`);
})

