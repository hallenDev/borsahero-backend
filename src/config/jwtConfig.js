import dotenv from "dotenv";

dotenv.config();

export const jwtConfig = {
  SECRET: process.env.JWT_SECRET,
  option: {
    algorithm: "HS256",
  },
};
