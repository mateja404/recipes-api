import { Controller, Body, Req, Param, Get, Post, Patch, Delete, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AuthGuard } from '../guards/auth.guard';
import { IpBanGuard } from '../guards/ip.guard';
import { PrivilageGuard } from '../guards/privilage.guard';
import { CreateCommentDto } from './dto';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { Types } from 'mongoose';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @UseGuards(AuthGuard, IpBanGuard)
    @Post('/postcomment/:id')
    createComment(@Param('id') id: Types.ObjectId, @Req() req: RequestWithUser, @Body() dto: CreateCommentDto) {
        const posterId = new Types.ObjectId(req.user.sub);
        return this.commentsService.createComment(id, posterId, dto.comment);
    }
}