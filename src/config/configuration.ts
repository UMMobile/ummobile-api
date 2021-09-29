import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import academicConfig from './academic.config';
import databaseConfig from './database.config';
import apiManagerConfig from './apiManager.config';
import identityServerConfig from './identityServer.config';
import generalConfig from './general.config';

export default ConfigModule.forRoot({
    load: [
        academicConfig, 
        apiManagerConfig,
        databaseConfig,
        identityServerConfig,
        generalConfig,
    ],
    validationSchema: Joi.object({
        NODE_ENV: Joi.string().optional().default('dev'),
        // Academic
        ACADEMIC_URL: Joi.string().required(),
        ACADEMIC_USER: Joi.string().required(),
        ACADEMIC_PASSWORD: Joi.string().required(),
        // API Manager
        AM_URL: Joi.string().required(),
        AM_API_KEY: Joi.string().required(),
        // Identity Server
        IS_URL: Joi.string().required(),
        IS_USER: Joi.string().required(),
        IS_PASSWORD: Joi.string().required(),
        // Database
        DATABASE_URI: Joi.string().required(),
        // Sentry
        SENTRY_DSN: Joi.string().required(),
    }),
    isGlobal: true,
});

export {
    academicConfig,
    apiManagerConfig,
    databaseConfig,
    identityServerConfig,
};