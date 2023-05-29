import { Injectable, Logger } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UsersService } from '../users/users.service';
import { Ticket } from './entities/ticket.entity';
import { TradeTicketDto } from './dto/trade-ticket.dto';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger();
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService
  ) {}
  async addNewTicket(
    createTicketDto: CreateTicketDto,
    id: string
  ): Promise<string | Ticket> {
    const userSession = await this.userService.findUserById(id);
    if (!userSession) {
      return 'Usuario não encontrado!';
    }
    try {
      userSession.tickets.unshift({
        _id: randomUUID(),
        category: createTicketDto.category,
        title: createTicketDto.title,
        dateBuy: new Date(Date.now()),
      });

      userSession.save();

      return userSession.tickets[0];
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  }

  async getTicketsByUser(id: string): Promise<Ticket[] | string> {
    const userSession = await this.userService.findUserById(id);

    if (userSession) {
      return userSession.tickets;
    } else {
      return 'Usuario não encontrado!';
    }
  }

  async tradeTicket(
    id_seller: string,
    tradeTicketDto: TradeTicketDto
  ): Promise<string> {
    const userSeller = await this.userService.findUserById(id_seller);

    const userBuyer = await this.userService.findUserByEmail(
      tradeTicketDto.emailBuyer
    );

    if (!userBuyer) {
      return `You are not signed. Please Sign up in ${this.configService.get(
        'web_url'
      )}`;
    }

    const ticketTrade = userSeller.tickets.find(
      (item) => item._id === tradeTicketDto.ticketId
    );

    if (!ticketTrade) {
      return `ticket ${tradeTicketDto.ticketId}, was not found! in User ${userSeller.firstName} ${userSeller.lastName}`;
    }

    try {
      userBuyer.tickets.unshift(ticketTrade);

      const index = userSeller.tickets.findIndex(
        (item) => item._id == ticketTrade._id
      );
      index >= 0 && userSeller.tickets.splice(index, 1);
      userBuyer.save();
      userSeller.save();
      return `Finish trade between ${userSeller.firstName} and ${userBuyer.firstName}.`;
    } catch (error) {
      throw new Error(error.toString());
    }
  }
}
