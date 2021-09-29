import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CovidQuestionnaireAnswerDocument = CovidQuestionnaireAnswer & Document;

@Schema({ timestamps: true })
export class CovidQuestionnaireAnswer {
  @Prop({
    type: Boolean,
    required: true,
  })
  canPass: Boolean;

  @Prop({type: [{
      country: {type: String, required: false},
      city: {type: String, required: false},
      date: {type: Date, required: false},
    }],
    _id: false,
  })
  countries: Record<string, any>[];

  @Prop({type: {
    yes: {type: Boolean},
    when: {type: Date, required: false},
  }})
  recentContact: Record<string, any>;

  @Prop({
    type: Map,
    of: Boolean,
    required: true,
  })
  majorSymptoms: Record<string, boolean>;

  @Prop({
    type: Map,
    of: Boolean,
    required: true,
  })
  minorSymptoms: Record<string, boolean>;
}

export const CovidQuestionnaireAnswerSchema = SchemaFactory.createForClass(CovidQuestionnaireAnswer);