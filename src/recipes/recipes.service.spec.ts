import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RecipesService } from './recipes.service';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { Recipe, RecipeDocument } from '../schema/recipe.schema';
import { ForbiddenException } from '@nestjs/common';

describe('RecipesService', () => {
  let service: RecipesService;
  let userModel: Model<UserDocument>;
  let recipeModel: Model<RecipeDocument>;

  beforeEach(async () => {
    const mockUserModel = {
      findById: jest.fn(),
    };

    const mockRecipeModel = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Recipe.name),
          useValue: mockRecipeModel,
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    recipeModel = module.get<Model<RecipeDocument>>(getModelToken(Recipe.name));
  });

  describe('deleteRecipeById', () => {
    it('should allow admin to delete any recipe', async () => {
      const userId = new Types.ObjectId();
      const recipeId = new Types.ObjectId();

      const adminUser = {
        _id: userId,
        email: 'admin@example.com',
        password: 'secret',
        role: 'admin',
        banned: false,
        aiSlots: 100
      };

      const mockRecipe = {
        _id: recipeId,
        userId: new Types.ObjectId(),
        deleteOne: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(adminUser)
      } as any);

      jest.spyOn(recipeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecipe)
      } as any);

      const result = await service.deleteRecipeById(userId, recipeId);

      expect(mockRecipe.deleteOne).toHaveBeenCalled();
      expect(result).toEqual({ message: "Recipe successfully deleted" });
    });

    it('should allow user to delete own recipe', async () => {
      const userId = new Types.ObjectId();
      const recipeId = new Types.ObjectId();

      const regularUser = {
        _id: userId,
        role: 'user',
        email: 'test@example.com',
        password: 'hashed',
        banned: false,
        aiSlots: 100,
      };

      const mockRecipe = {
        _id: recipeId,
        userId: {
          equals: (id: Types.ObjectId) => id.toString() === userId.toString(),
          toString: () => userId.toString(),
        },
        deleteOne: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(regularUser)
      } as any);

      jest.spyOn(recipeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecipe)
      } as any);

      const result = await service.deleteRecipeById(userId, recipeId);

      expect(mockRecipe.deleteOne).toHaveBeenCalled();
      expect(result).toEqual({ message: "Recipe successfully deleted" });
    });

    it('should throw ForbiddenException if user is not admin and does not own the recipe', async () => {
      const userId = new Types.ObjectId();
      const recipeId = new Types.ObjectId();

      const regularUser = {
        _id: userId,
        role: 'user',
      };

      const mockRecipe = {
        _id: recipeId,
        userId: new Types.ObjectId(),
        deleteOne: jest.fn(),
      };

      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(regularUser),
      } as any);

      jest.spyOn(recipeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecipe),
      } as any);

      await expect(service.deleteRecipeById(userId, recipeId)).rejects.toThrow(ForbiddenException);
      expect(mockRecipe.deleteOne).not.toHaveBeenCalled();
    });
  });
});