import { initTRPC } from '@trpc/server';
import { ContextType, NotionContextType } from 'types';
 
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<ContextType>().create();
const n = initTRPC.context<NotionContextType>().create();
 
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const notion = n.router;
export const publicProcedure = t.procedure;