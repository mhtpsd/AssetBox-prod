import { Module, Global } from '@nestjs/common';
import { DlqService } from './dlq.service';

@Global()
@Module({
  providers: [DlqService],
  exports: [DlqService],
})
export class DlqModule {}
