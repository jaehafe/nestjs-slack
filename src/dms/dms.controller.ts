import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('DM')
@Controller('api/workspaces/:url/dms')
export class DmsController {
  @ApiParam({
    name: 'url',
    required: true,
    description: '워크스페이스 url',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '사용자 아이디',
  })
  @ApiQuery({
    name: 'perPage',
    required: true,
    description: '한번에 가져오는 개수',
  })
  @ApiQuery({
    name: 'page',
    required: true,
    description: '불러올 페이지',
  })
  // http://localhost:3030/api/workspaces/123/dms/123/chats?perPage=10&page=1
  @Get(':id/chats')
  getChat(@Query() query, @Param() param) {
    console.log('query=', query.perPage, query.page);
    console.log('param=', param.id, param.url);
  }

  @Post(':id/chats')
  postChat(@Body() body) {}
}
