import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionnaireDto } from './create-questionnaire.dto';

export class UpdateQuestionnaireDto extends PartialType(CreateQuestionnaireDto) {}
