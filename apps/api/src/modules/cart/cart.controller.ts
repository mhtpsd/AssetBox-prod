import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Get current user's cart
   */
  @Get()
  async getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getOrCreateCart(userId);
  }

  /**
   * Add item to cart
   */
  @Post('items')
  async addItem(@CurrentUser('id') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(userId, dto.assetId);
  }

  /**
   * Remove item from cart
   */
  @Delete('items/:assetId')
  async removeItem(
    @CurrentUser('id') userId: string,
    @Param('assetId', ParseUUIDPipe) assetId: string,
  ) {
    return this.cartService.removeItem(userId, assetId);
  }

  /**
   * Clear cart
   */
  @Delete()
  async clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}