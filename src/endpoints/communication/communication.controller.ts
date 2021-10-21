import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { CommunicationService } from './communication.service';
import { Post } from './entities/post.entity';

@ApiTags('Communication')
@Controller('communication')
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @ApiOperation({summary: "Fetches the institutional news"})
  @ApiQuery({
    name: 'quantity',
    description: 'The quantity of posts to fetch.',
    required: false,
    schema: {
      default: 14,
      type: 'integer'
    }
  })
  @Get('news')
  getNews(
    @Query('quantity', new DefaultValuePipe(14), ParseIntPipe) quantity: number,
  ): Observable<Post[]> {
    return this.communicationService.fetchNews(quantity);
  }

  @ApiOperation({summary: "Fetches the institutional events"})
  @ApiQuery({
    name: 'quantity',
    description: 'The quantity of posts to fetch.',
    required: false,
    schema: {
      default: 14,
      type: 'integer'
    }
  })
  @Get('events')
  getEvents(
    @Query('quantity', new DefaultValuePipe(14), ParseIntPipe) quantity: number,
  ): Observable<Post[]> {
    return this.communicationService.fetchEvents(quantity);
  }

  @ApiOperation({summary: "Fetches the institutional blog posts"})
  @ApiQuery({
    name: 'quantity',
    description: 'The quantity of posts to fetch.',
    required: false,
    schema: {
      default: 14,
      type: 'integer'
    }
  })
  @Get('blog')
  getBlog(
    @Query('quantity', new DefaultValuePipe(14), ParseIntPipe) quantity: number,
  ): Observable<Post[]> {
    return this.communicationService.fetchBlog(quantity);
  }
}
