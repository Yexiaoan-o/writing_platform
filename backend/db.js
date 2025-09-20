import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "writing_platform",
  password: "12345678",
  port: 5432,
});
