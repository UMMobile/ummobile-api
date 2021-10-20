import { registerAs } from "@nestjs/config";

export default registerAs('general', () => ({
  env: process.env.NODE_ENV,
  sentry_dsn: process.env.SENTRY_DSN,
  conectate: process.env.CONECTATE_URL,
}));