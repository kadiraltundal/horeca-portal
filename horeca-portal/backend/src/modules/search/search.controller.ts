import {
  Controller,
  Get,
  Delete,
  Query,
  UseGuards,
  Request,
  Optional,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  async search(
    @Query('q') query: string,
    @Query('limit') limit?: number,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    return this.searchService.search(query, userId, limit);
  }

  @Public()
  @Get('autocomplete')
  async autocomplete(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    return this.searchService.autocomplete(query, limit);
  }

  @Public()
  @Get('popular')
  async getPopularSearches(@Query('limit') limit?: number) {
    return this.searchService.getPopularSearches(limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getSearchHistory(@Request() req: any, @Query('limit') limit?: number) {
    return this.searchService.getSearchHistory(req.user.id, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('history')
  async clearSearchHistory(@Request() req: any) {
    return this.searchService.clearSearchHistory(req.user.id);
  }
}