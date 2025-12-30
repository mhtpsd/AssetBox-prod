import { Controller, Get, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService:  OrdersService) {}

  /**
   * Get user's orders
   */
  @Get()
  async getOrders(
    @CurrentUser('id') userId: string,
    @Query('page') page?:  number,
    @Query('limit') limit?: number,
  ) {
    return this.ordersService.getUserOrders(userId, page || 1, limit || 20);
  }

  /**
   * Get single order
   */
  @Get(':id')
  async getOrder(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) orderId: string,
  ) {
    return this.ordersService.getOrder(userId, orderId);
  }
}