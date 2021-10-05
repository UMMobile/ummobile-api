import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

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
      $ref: '#/components/schemas/RecentCountry'
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
      $ref: '#/components/schemas/RecentContact'
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