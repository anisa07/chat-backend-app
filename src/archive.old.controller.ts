import { Controller, Get, Param } from '@nestjs/common';

@Controller('archive')
export class ArchiveOLdController {
  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return `TBD Return archive for #${userId}`;
    // [{from, to, message}] ?
  }
}
