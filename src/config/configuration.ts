import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import academicConfig from './academic.config';
import databaseConfig from './database.config';
import apiManagerConfig from './apiManager.config';
import identityServerConfig from './identityServer.config';
import generalConfig from './general.config';
import calendarConfig from './calendar.config';

export default ConfigModule.forRoot({
    load: [
        academicConfig, 
        apiManagerConfig,
        databaseConfig,
        identityServerConfig,
        calendarConfig,
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
        PAYMENT_URL: Joi.string().required(),
        INVOICE_URL: Joi.string().required(),
        // Identity Server
        IS_URL: Joi.string().required(),
        IS_USER: Joi.string().required(),
        IS_PASSWORD: Joi.string().required(),
        // Database
        DATABASE_URI: Joi.string().required(),
        // Sentry
        SENTRY_DSN: Joi.string().required(),
        // Calendar
        CALENDAR_URL: Joi.string().required(),
        CALENDAR_KEY: Joi.string().required(),
        CALENDAR_EMPLOYEE_ID: Joi.string().required(),
        CALENDAR_STUDENT_ID: Joi.string().required(),
    }),
    isGlobal: true,
});

export {
    academicConfig,
    apiManagerConfig,
    databaseConfig,
    identityServerConfig,
};