import { registerAs } from "@nestjs/config";

export default registerAs('am', () => ({
  url: process.env.AM_URL,
  key: process.env.AM_API_KEY,
  payment: process.env.PAYMENT_URL,
  invoice: process.env.INVOICE_URL,
}));