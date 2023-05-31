import { Module } from '@nestjs/common';
import { HederaService } from "./hedera.service";

@Module({
  imports: [
  ],
  providers: [HederaService],
  exports: [HederaService]
})
export class HederaModule {}
