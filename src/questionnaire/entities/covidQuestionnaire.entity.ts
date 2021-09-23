import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CovidQuestionnaireAnswer, CovidQuestionnaireAnswerDocument, CovidQuestionnaireAnswerSchema } from './covidQuestionnaireAnswer.entity';

export type CovidQuestionnaireDocument = CovidQuestionnaire & Document;

@Schema()
export class CovidQuestionnaire {
  @Prop()
  _id: String;

  @Prop({
    type: [CovidQuestionnaireAnswerSchema]
  })
  answers: CovidQuestionnaireAnswer[];
}

export const CovidQuestionnaireSchema = SchemaFactory.createForClass(CovidQuestionnaire);