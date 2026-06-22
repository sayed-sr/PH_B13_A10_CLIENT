import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Connect to your MongoDB
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("ticketBariDB"); // Updated to match the backend DB name

export const auth = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        // Requirement 2: Google Login
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
                defaultValue: "user" // Defaults all new signups to 'user'
            },
            isFraud: {
                type: "boolean",
                required: false,
                defaultValue: false
            }
        }
    }
});