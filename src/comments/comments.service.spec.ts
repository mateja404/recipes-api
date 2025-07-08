import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CommentsService } from './comments.service';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { Recipe, RecipeDocument } from '../schema/recipe.schema';
import { NotificationsService } from 'src/notifications/notifications.service';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

const mockNotificationsService = {
  sendToUser: jest.fn(),
};

describe('CommentsService', () => {
  let service: CommentsService;
  let notificationsService: NotificationsService;
  let userModel: Model<UserDocument>;
  let recipeModel: Model<RecipeDocument>;

  beforeEach(async () => {
    const mockUserModel = {
      findById: jest.fn(),
    };

    const mockRecipeModel = {
      findById: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findByIdAndUpdate: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Recipe.name),
          useValue: mockRecipeModel,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService
        }
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    recipeModel = module.get<Model<RecipeDocument>>(getModelToken(Recipe.name));
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  describe('createComment', () => {
    it('should throw notfoundexception if recipe is not found', async () => { 
      jest.spyOn(recipeModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

      expect(recipeModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw notfoundexception if recipe is not found', async () => {
      jest.spyOn(recipeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

      expect(recipeModel.findById).not.toHaveBeenCalled();
    });

    it('should send notification to user via socket.io', async () => {
      const recipeId = new Types.ObjectId();
      const userId = new Types.ObjectId();

      const mockRecipe = {
        _id: recipeId,
        userId: new Types.ObjectId(),
        comments: [],
      };

      const mockUser = {
        _id: userId,
        username: 'TestUser',
      };

      jest.spyOn(recipeModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecipe),
      } as any);

      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await service.createComment(recipeId, userId, 'Nice!');

      expect(notificationsService.sendToUser).toHaveBeenCalledWith(
        String(mockRecipe.userId),
        'You got new notification from TestUser!'
      );

      expect(result).toEqual({ message: 'Comment has been successfully created' });
    });
  });
});