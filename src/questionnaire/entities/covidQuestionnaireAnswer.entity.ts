import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { RecentContact, RecentCountry } from '../dto/createCovidQuestionnaireAnswer.dto';

export type CovidQuestionnaireAnswerDocument = CovidQuestionnaireAnswer & Document;

@Schema({ timestamps: true })
export class CovidQuestionnaireAnswer {
  @Prop({
    type: Boolean,
    required: true,
  })
  canPass: boolean;

  @ApiProperty({
    type: 'array',
    items: {
      $ref: getSchemaPath(RecentCountry)
    },
    required: false    
  })
  @Prop({type: [{
      country: {type: String, required: false},
      city: {type: String, required: false},
      date: {type: Date, required: false},
    }],
    _id: false,
  })
  countries: Record<string, any>[];

  @ApiProperty({
    oneOf: [{
      $ref: getSchemaPath(RecentContact)
    }]
  })
  @Prop({type: {
    yes: {type: Boolean},
    when: {type: Date, required: false},
  }})
  recentContact: Record<string, any>;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'boolean'
    }
  })
  @Prop({
    type: Map,
    of: Boolean,
    required: true,
  })
  majorSymptoms: Record<string, boolean>;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'boolean'
    }
  })
  @Prop({
    type: Map,
    of: Boolean,
    required: true,
  })
  minorSymptoms: Record<string, boolean>;
}

export const CovidQuestionnaireAnswerSchema = SchemaFactory.createForClass(CovidQuestionnaireAnswer);