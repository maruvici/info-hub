import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Use a global variable to prevent multiple connections in development (HMR)
const globalForDb = global as unknown as { 
  conn: postgres.Sql | undefined 
};

// Lazy initialize the connection
const conn = globalForDb.conn ?? postgres(connectionString, { 
  prepare: false,
  // This helps prevent hanging by forcing a timeout if the handshake stalls
  connect_timeout: 10 
});

if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });