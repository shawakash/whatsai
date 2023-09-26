import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { notionRouter } from './server/index';
import * as trpcNext from '@trpc/server/adapters/next';
import { PrismaClient } from 'database';
import { role } from 'types';

export const createNextApiHandler = () => {
    return trpcNext.createNextApiHandler({
        router: notionRouter,
        createContext: ({
            req,
            res
        }) => {
            return {
                prisma: new PrismaClient()
            }
        },
      });
}