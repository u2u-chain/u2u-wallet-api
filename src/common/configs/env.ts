import * as dotenv from "dotenv";
dotenv.config();

export const APP_PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;

export const JWT_SECRET = process.env.JWT_SECRET || "secret";
export const JWT_ISSUER = process.env.JWT_ISSUER || "u2u-wallet-api";
export const JWT_TOKEN_LIFESPAN = process.env.JWT_TOKEN_LIFESPAN || "1m";
export const JWT_REFRESH_TOKEN_LIFESPAN = process.env.JWT_REFRESH_TOKEN_LIFESPAN

export const PASSWORD_SALT_SIZE = process.env.PASSWORD_SALT_SIZE;
export const SYMMETRIC_PASSWORD_SECRET = process.env.SYMMETRIC_PASSWORD_SECRET;


export const TREASURE_ACCOUNT_ID = process.env.TREASURE_ACCOUNT_ID;
export const TREASURE_ACCOUNT_PRIVATE_KEY = process.env.TREASURE_ACCOUNT_PRIVATE_KEY;
