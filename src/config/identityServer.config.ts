import { registerAs } from "@nestjs/config";

export default registerAs('is', () => ({
  url: process.env.IS_URL,
  user: process.env.IS_USER,
  password: process.env.IS_PASSWORD,
}));