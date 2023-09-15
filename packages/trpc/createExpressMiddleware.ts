import { PrismaClient } from "database"
import { appRouter, trpcExpress } from "./server"
import { role } from "types"
import { getCookie } from "./lib/helper"

export const createExpressMiddleware = (TWILIO_ACCOUNT_SID: string, TWILIO_AUTH_TOKEN: string, TWILIO_PHONE_NUMBER: string) => {
    return trpcExpress.createExpressMiddleware({
        router: appRouter  
        ,
        createContext({
          req,  
          res,
        }: trpcExpress.CreateExpressContextOptions) {
          return {
              TWILIO_ACCOUNT_SID: TWILIO_ACCOUNT_SID || '',
              TWILIO_AUTH_TOKEN: TWILIO_AUTH_TOKEN || '',
              TWILIO_PHONE_NUMBER: TWILIO_PHONE_NUMBER || '',
              prisma: new PrismaClient(),
              prevMessage: [
                  { role: role.System, content: 'You are a chat generator' }
              ],   
              preMessagesId: parseInt(req.headers.premessagesid as string)
          }    
        },  
      })
}