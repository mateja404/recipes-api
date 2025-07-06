import { Controller, Body, Req, Param, Get, Post, Patch, Delete, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { IpBanGuard } from 'src/guards/ip.guard';
import { PrivilageGuard } from 'src/guards/privilage.guard';
import { CreateCommentDto } from './dto';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}
}