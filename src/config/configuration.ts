import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import academicConfig from './academic.config';
import databaseConfig from './database.config';
import apiManagerConfig from './apiManager.config';
import identityServerConfig from './identityServer.config';

export default ConfigModule.forRoot({
    load: [academicConfig, apiManagerConfig, databaseConfig, identityServerConfig],
    validationSchema: Joi.object({
        ACADEMIC_URL: Joi.string().required(),
        ACADEMIC_USER: Joi.string().required(),
        ACADEMIC_PASSWORD: Joi.string().required(),
        AM_URL: Joi.string().required(),
        AM_API_KEY: Joi.string().required(),
        IS_URL: Joi.string().required(),
        IS_USER: Joi.string().required(),
        IS_PASSWORD: Joi.string().required(),
        DATABASE_URI: Joi.string().required(),
    }),
    isGlobal: true,
});

export {
    academicConfig,
    apiManagerConfig,
    databaseConfig,
    identityServerConfig,
};