import cookie, { serialize } from "cookie";
import { role } from "types";

export const splitMessage = (text: string, chunkSize: number) => {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}

export const setCookie = (name: string, token: number) => {
    const cookieSerialized = serialize(name, (token).toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });

    return cookieSerialized;
}

export const getCookie = (req: any, name: string) => {
    const cookieHeader = cookie.parse(req.headers.cookie || '');
    if (!cookieHeader) return
    // const cookies = cookie.parse(cookieHeader)
    return cookieHeader[name]
}

export const generateMessageArray = (prev: ({ messages: { body: string; role: role; }[]; })) => {
    const result = prev.messages.map((mess: { body: string; role: role }) => ({
        content: mess.body,
        role: mess.role
    }));
    return result;
}