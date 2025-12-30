import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateTicketDto, SendMessageDto, UpdateTicketDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('support')
@UseGuards(AuthGuard)
export class SupportController {
  constructor(private readonly supportService:  SupportService) {}

  /**
   * Create new ticket
   */
  @Post('tickets')
  async createTicket(@CurrentUser('id') userId: string, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(userId, dto);
  }

  /**
   * Get user's tickets
   */
  @Get('tickets')
  async getUserTickets(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.supportService.getUserTickets(userId, page || 1, limit || 20, status);
  }

  /**
   * Get single ticket
   */
  @Get('tickets/:id')
  async getTicket(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) ticketId: string) {
    return this.supportService.getTicket(userId, ticketId, false);
  }

  /**
   * Send message in ticket
   */
  @Post('tickets/:id/messages')
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) ticketId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.supportService.sendMessage(userId, ticketId, dto, false);
  }

  /**
   * Update ticket (close, etc.)
   */
  @Patch('tickets/:id')
  async updateTicket(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) ticketId: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.supportService.updateTicket(userId, ticketId, dto, false);
  }

  // ===== ADMIN ROUTES =====

  /**
   * Get all tickets (admin)
   */
  @Get('admin/tickets')
  @UseGuards(AdminGuard)
  async getAllTickets(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.supportService.getAllTickets(page || 1, limit || 20, status, priority);
  }

  /**
   * Get ticket (admin)
   */
  @Get('admin/tickets/:id')
  @UseGuards(AdminGuard)
  async getTicketAdmin(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) ticketId: string,
  ) {
    return this.supportService.getTicket(userId, ticketId, true);
  }

  /**
   * Reply to ticket (admin)
   */
  @Post('admin/tickets/:id/messages')
  @UseGuards(AdminGuard)
  async replyToTicket(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) ticketId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.supportService.sendMessage(userId, ticketId, dto, true);
  }

  /**
   * Update ticket status (admin)
   */
  @Patch('admin/tickets/:id')
  @UseGuards(AdminGuard)
  async updateTicketAdmin(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) ticketId: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.supportService.updateTicket(userId, ticketId, dto, true);
  }

  /**
   * Get support stats (admin)
   */
  @Get('admin/stats')
  @UseGuards(AdminGuard)
  async getStats() {
    return this.supportService.getStats();
  }
}