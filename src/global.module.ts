import { Module, Global } from '@nestjs/common';
import { ArchiveService } from './archive/archive.service';

@Global()
@Module({
  controllers: [],
  providers: [ArchiveService],
  exports: [ArchiveService],
})
export class GlobalModule {}
