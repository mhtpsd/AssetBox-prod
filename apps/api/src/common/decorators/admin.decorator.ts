import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';

export function Admin() {
  return applyDecorators(UseGuards(AuthGuard, AdminGuard));
}