import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { AuthGuard } from 'src/guards/auth.guard';
import { IpBanGuard } from 'src/guards/ip.guard';
import { PrivilageGuard } from 'src/guards/privilage.guard';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { Types } from 'mongoose';
import { CreateCommentDto } from './dto';

// guardovi uvek prolaze
const mockGuard = {
  canActivate: jest.fn(() => true),
};

describe('CommentsService', () => {
  let controller: CommentsController;
  let service: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            createComment: jest.fn()
          }
        }
      ]
    })
      .overrideGuard(AuthGuard)
      .useValue(mockGuard)
      .overrideGuard(IpBanGuard)
      .useValue(mockGuard)
      .overrideGuard(PrivilageGuard)
      .useValue(mockGuard)
      .compile();
    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call commentsService.createComment', async () => {
    const createCommentSpy = jest.spyOn(service, 'createComment').mockResolvedValue({ message: "Comment has been successfully created" });
    const mockRequest = { user: { sub: new Types.ObjectId('60d5ec49e4e6b1001f3e7a89') } } as unknown as RequestWithUser;
    const mockRecipeId = new Types.ObjectId('60d5ec49e4e6b1001f3e7a89');
    const createCommentDto = new CreateCommentDto();
    createCommentDto.comment = 'eeee';
    const result = await controller.createComment(mockRecipeId, mockRequest, createCommentDto);
    
    expect(createCommentSpy).toHaveBeenCalled();
    expect(result).toEqual({ message: "Comment has been successfully created" });
  });
});