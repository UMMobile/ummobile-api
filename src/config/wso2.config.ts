import { registerAs } from "@nestjs/config";

export default registerAs('wso2', () => ({
  url: process.env.WSO2_URL,
  api_key: process.env.WSO2_API_KEY,
}));