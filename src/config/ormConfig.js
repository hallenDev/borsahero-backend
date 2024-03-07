import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();

const ormConfig = {
  type: process.env.DB_TYPE || "postgres",
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME || "administrater",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "borsa_hero",
  entities: ["src/entity/**/*.js"],
  synchronize: true,
  subscribers: [],
};

const dataSource = new DataSource(ormConfig);

export default dataSource;
