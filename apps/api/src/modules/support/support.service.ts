import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTicketDto, SendMessageDto, UpdateTicketDto } from './dto';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Create a new support ticket
   */
  async createTicket(userId: string, dto: CreateTicketDto) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        subject: dto.subject,
        priority: dto.priority,
        status: 'OPEN',
        messages: {
          create: {
            senderId: userId,
            message: dto.message,
            isAdmin: false,
          },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Notify user
    await this.notifications.create({
      userId,
      type: 'SYSTEM',
      title: 'Support Ticket Created',
      message: `Your support ticket #${ticket.id. slice(0, 8)} has been created. We'll respond soon. `,
      data: {
        ticketId:  ticket.id,
      },
    });

    this.logger.log(`Support ticket created: ${ticket.id} by user ${userId}`);

    return this.formatTicket(ticket);
  }

  /**
   * Get user's tickets
   */
  async getUserTickets(userId: string, page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: {
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take:  limit,
      }),
      this.prisma.supportTicket. count({ where }),
    ]);

    const tickets = items.map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      messageCount: ticket._count.messages,
      createdAt: ticket. createdAt,
      updatedAt: ticket.updatedAt,
    }));

    return {
      items: tickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single ticket with messages
   */
  async getTicket(userId: string, ticketId: string, isAdmin = false) {
  const ticket = await this.prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket) {
    throw new NotFoundException('Ticket not found');
  }

  // Check access
  if (!isAdmin && ticket.userId !== userId) {
    throw new ForbiddenException('You can only view your own tickets');
  }

  // Fetch user separately
  const user = await this.prisma.user.findUnique({
    where: { id: ticket.userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
    },
  });

  return this.formatTicket({ ...ticket, user });
}

  /**
   * Send message in ticket
   */
  async sendMessage(userId: string, ticketId: string, dto: SendMessageDto, isAdmin = false) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Check access for non-admin
    if (!isAdmin && ticket.userId !== userId) {
      throw new ForbiddenException('You can only reply to your own tickets');
    }

    // Create message
    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: userId,
        message: dto.message,
        isAdmin: isAdmin,
      },
    });

    // Update ticket status and timestamp
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (isAdmin && ticket.status === 'OPEN') {
      updateData.status = 'IN_PROGRESS';
    }

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });

    // Notify the other party
    if (isAdmin) {
      // Admin replied, notify user
      await this.notifications.create({
        userId: ticket.userId,
        type: 'SYSTEM',
        title: 'Support Response',
        message: `You have a new response on ticket #${ticketId. slice(0, 8)}`,
        data: {
          ticketId,
        },
      });
    } else {
      // User replied, notify admins (you can implement admin notifications differently)
      this.logger.log(`New message on ticket ${ticketId} from user`);
    }

    return {
      id: message.id,
      message: message.message,
      isAdminReply:  message.isAdmin,
      createdAt: message.createdAt,
      senderId: message.senderId,
    };
  }

  /**
   * Update ticket (admin or user can close)
   */
  async updateTicket(userId: string, ticketId: string, dto: UpdateTicketDto, isAdmin = false) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id:  ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (!isAdmin && ticket.userId !== userId) {
      throw new ForbiddenException('You can only update your own tickets');
    }

    const updateData: any = {};

    // Users can only close their own tickets
    if (! isAdmin && dto.status) {
      if (dto.status === 'CLOSED') {
        updateData.status = 'CLOSED';
      }
    }

    // Admins can update status and priority
    if (isAdmin) {
      if (dto.status) updateData.status = dto.status;
      if (dto.priority) updateData.priority = dto.priority;
    }

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });

    // Notify user if admin changed status
    if (isAdmin && dto.status) {
      await this.notifications.create({
        userId: ticket.userId,
        type: 'SYSTEM',
        title: 'Ticket Status Updated',
        message: `Your ticket #${ticketId.slice(0, 8)} status changed to ${dto.status}`,
        data: {
          ticketId,
          status: dto.status,
        },
      });
    }

    return this.formatTicket(updated);
  }

  /**
   * Get all tickets (admin only)
   */
  async getAllTickets(page = 1, limit = 20, status?:  string, priority?: string) {
    const skip = (page - 1) * limit;

    const where:  any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [items, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: {
          _count: {
            select:  { messages: true },
          },
        },
        orderBy:  [
          { status: 'asc' }, // OPEN first
          { priority: 'desc' }, // HIGH priority first
          { updatedAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    const tickets = items.map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      messageCount: ticket._count.messages,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    }));

    return {
      items: tickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get support statistics (admin)
   */
  async getStats() {
    const [openTickets, inProgressTickets, resolvedTickets, totalTickets] = await Promise.all([
      this.prisma. supportTicket.count({ where: { status: 'OPEN' } }),
      this.prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.supportTicket. count({ where: { status: 'RESOLVED' } }),
      this.prisma.supportTicket.count(),
    ]);

    return {
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets: totalTickets - openTickets - inProgressTickets - resolvedTickets,
      totalTickets,
    };
  }

  /**
   * Format ticket for response
   */
  private formatTicket(ticket: any) {
    return {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      user: ticket.user,
      messages: ticket.messages?. map((msg: any) => ({
        id: msg.id,
        message: msg.message,
        isAdminReply:  msg.isAdmin,
        createdAt: msg. createdAt,
        senderId: msg.senderId,
      })),
    };
  }
}