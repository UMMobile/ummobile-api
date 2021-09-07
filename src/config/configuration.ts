import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import academicConfig from './academic.config';

export default ConfigModule.forRoot({
    load: [academicConfig],
    validationSchema: Joi.object({
        ACADEMIC_URL: Joi.string().required(),
        ACADEMIC_USER: Joi.string().required(),
        ACADEMIC_PASSWORD: Joi.string().required(),
    }),
    isGlobal: true,
});

export {
    academicConfig,
};