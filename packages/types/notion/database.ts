import { z } from "zod";

// Define a schema for the 'icon' field
const iconSchema = z.object({
    type: z.literal("emoji"),
    emoji: z.string(),
});

// Define a schema for the 'cover' field
const coverSchema = z.object({
    type: z.literal("external"),
    external: z.object({
        url: z.string().url(),
    }),
});

// Define a schema for the 'title' field
const titleSchema = z.array(
    z.object({
        type: z.literal("text"),
        text: z.object({
            content: z.string(),
            link: z.nullable(z.unknown()), // You might want to adjust this type according to your needs
        }),
    })
);

const annotationsSchema = z.object({
    bold: z.boolean(),
    italic: z.boolean(),
    strikethrough: z.boolean(),
    underline: z.boolean(),
    code: z.boolean(),
    color: z.string(),
});

// Define a schema for the individual rich text objects
const richTextItemSchema = z.object({
    type: z.literal("text"),
    text: z.object({
        content: z.string(),
        link: z.nullable(z.unknown()), // You might want to adjust this type according to your needs
    }),
    annotations: annotationsSchema,
    plain_text: z.string(),
    href: z.nullable(z.unknown()), // You might want to adjust this type according to your needs
});

// Define the schema for the rich_text array
const richTextSchema = z.array(richTextItemSchema);

// Define a schema for the 'properties' field
const propertiesSchema = z.object({
    Name: z.object({
        title: z.object({}),
    }),
    Description: z.object({
        rich_text: richTextSchema,
    }),
    "In stock": z.object({
        checkbox: z.object({}),
    }),
    "Food group": z.object({
        select: z.object({
            options: z.array(
                z.object({
                    name: z.string(),
                    color: z.string(),
                })
            ),
        }),
    }),
    Price: z.object({
        number: z.object({
            format: z.literal("dollar"),
        }),
    }),
    "Last ordered": z.object({
        date: z.object({}),
    }),
    Meals: z.object({
        relation: z.object({
            database_id: z.string(),
            single_property: z.object({}),
        }),
    }),
    "Number of meals": z.object({
        rollup: z.object({
            rollup_property_name: z.string(),
            relation_property_name: z.string(),
            function: z.literal("count"),
        }),
    }),
    "Store availability": z.object({
        type: z.literal("multi_select"),
        multi_select: z.object({
            options: z.array(
                z.object({
                    name: z.string(),
                    color: z.string(),
                })
            ),
        }),
    }),
    "+1": z.object({
        people: z.object({}),
    }),
    Photo: z.object({
        files: z.object({}),
    }),
});

// Define the complete schema for the structure
const schema = z.object({
    icon: iconSchema,
    cover: coverSchema,
    title: titleSchema,
    properties: propertiesSchema,
});

// Example data to validate
const data = {
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
        // ... (properties data)
    },
};

// Validate the data against the schema
const result = schema.safeParse(data);

if (result.success) {
    console.log("Data is valid:", result.data);
} else {
    console.error("Validation errors:", result.error);
}
