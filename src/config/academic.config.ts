import { registerAs } from "@nestjs/config";

export default registerAs('academic', () => ({
  url: process.env.ACADEMIC_URL,
  user: process.env.ACADEMIC_USER,
  password: process.env.ACADEMIC_PASSWORD,
}));