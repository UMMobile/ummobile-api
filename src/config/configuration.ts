import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import academicConfig from './academic.config';
import databaseConfig from './database.config';
import wso2Config from './wso2.config';

export default ConfigModule.forRoot({
    load: [academicConfig, wso2Config, databaseConfig],
    validationSchema: Joi.object({
        ACADEMIC_URL: Joi.string().required(),
        ACADEMIC_USER: Joi.string().required(),
        ACADEMIC_PASSWORD: Joi.string().required(),
        WSO2_URL: Joi.string().required(),
        WSO2_API_KEY: Joi.string().required(),
        DATABASE_URI: Joi.string().required(),
    }),
    isGlobal: true,
});

export {
    academicConfig,
    wso2Config,
    databaseConfig,
};