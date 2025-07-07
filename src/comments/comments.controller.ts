import { Controller, Body, Req, Param, Get, Post, Patch, Delete, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { IpBanGuard } from 'src/guards/ip.guard';
import { PrivilageGuard } from 'src/guards/privilage.guard';
import { CreateCommentDto } from './dto';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { Types } from 'mongoose';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @UseGuards(AuthGuard, IpBanGuard)
    @Post('/postcomment/:id')
    postComment(@Param('id') id: Types.ObjectId, @Req() req: RequestWithUser, @Body() dto: CreateCommentDto) {
        const posterId = new Types.ObjectId(req.user.sub);
        return this.commentsService.createComment(id, posterId, dto.comment);
    }
}