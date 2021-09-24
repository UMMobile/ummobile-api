import { PartialType } from '@nestjs/mapped-types';
import { CreateFinancialDto } from './create-financial.dto';

export class UpdateFinancialDto extends PartialType(CreateFinancialDto) {}
