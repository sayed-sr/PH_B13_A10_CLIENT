import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";


const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("ticketBariDB");

export const auth = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "user" 
            },
            isFraud: {
                type: "boolean",
                required: false,
                defaultValue: false
            }
        }
    }
});