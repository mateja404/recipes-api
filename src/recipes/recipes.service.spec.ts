import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RecipesService } from './recipes.service';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { Recipe, RecipeDocument } from '../schema/recipe.schema';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JsonWebTokenError } from '@nestjs/jwt';

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
      find: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn()
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

    describe('getAllRecipes', () => {
      it('should return all recipes', async () => {
        jest.spyOn(recipeModel, 'find').mockReturnValue({
          exec: jest.fn().mockResolvedValue(['recipe1', 'recipe2']),
        } as any);

        const result = await service.getAllRecipes();

        expect(recipeModel.find).toHaveBeenCalled();
        expect(result).toEqual({ recipes: ['recipe1', 'recipe2'] });
      });
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

  describe('createRecipe', () => {
    it('should createRecipe', async () => {
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
        userId: new Types.ObjectId(),
        deleteOne: jest.fn(),
      };

      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(regularUser)
      } as any);

      jest.spyOn(recipeModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

      jest.spyOn(recipeModel, 'create').mockResolvedValue({
        _id: new Types.ObjectId(),
        userId: userId,
        title: 'Pizza',
        recipeText: 'EEE',
        author: 'matke'
      } as any);

      const result = await service.createRecipe(userId, 'aaa', 'aaa');

      expect(userModel.findById).toHaveBeenCalled();
      expect(recipeModel.findOne).toHaveBeenCalled();
      expect(recipeModel.create).toHaveBeenCalled();
      expect(result).toEqual({ message: "Recipe successfully created" });
    });

    it('should throw notfoundexception if user is not found', async () => {
      const userId = new Types.ObjectId();
      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

      await expect(service.createRecipe(userId, 'Pizza', 'wow')).rejects.toThrow(NotFoundException);
      expect(recipeModel.create).not.toHaveBeenCalled();
    });

    it('should throw error if recipe already exist', async () => {
      const userId = new Types.ObjectId();
      const recipeId = new Types.ObjectId();

      const regularRecipe = {
        _id: recipeId,
        userId: userId,
        title: 'Pizza',
        recipeText: 'Ill teach you how to make excellent italian pizza',
        author: 'matke'
      };

      jest.spyOn(recipeModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(regularRecipe)
      } as any);

      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: userId, username: 'matke' }),
      } as any);

      await expect(service.createRecipe(userId, 'Pizza', 'wow')).rejects.toThrow(ConflictException);
      expect(recipeModel.create).not.toHaveBeenCalled();
    });
  });

  describe('patchRecipe', () => {
    it('should throw notfoundexception if user is not found', async () => {
      const userId = new Types.ObjectId();
      const recipeId = new Types.ObjectId();
      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

      await expect(service.patchRecipe(recipeId, userId, 'Pizza', 'wow')).rejects.toThrow(NotFoundException);
      expect(recipeModel.create).not.toHaveBeenCalled();
    });

    it('should throw notfoundexception if recipe is not found', async () => {
      const recipeId = new Types.ObjectId;
      const userId = new Types.ObjectId;
      const title = 'Pizza bro';
      const recipeText = 'Pizza boy';

      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

      jest.spyOn(recipeModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any);

      await expect(service.patchRecipe(recipeId, userId, title, recipeText)).rejects.toThrow(NotFoundException);
      expect(recipeModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should patch recipe', async () => {
      const userId = new Types.ObjectId();
      const recipeId = new Types.ObjectId();
      const title = 'Pizza boy';
      const recipeText = 'New York pizza';
      const regularUser = {
        _id: userId,
        role: 'user',
        email: 'test@example.com',
        password: 'hashed',
        banned: false,
        aiSlots: 100,
      };
      const regularRecipe = {
        _id: recipeId,
        userId: userId,
        title: 'Pizza',
        recipeText: 'Ill teach you how to make excellent italian pizza',
        author: 'matke'
      };

      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(regularUser)
      } as any);

      jest.spyOn(recipeModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue({ message: "Recipe edited successfully" })
      } as any);

      const result = await service.patchRecipe(recipeId, userId, title, recipeText);

      expect(userModel.findById).toHaveBeenCalled();
      expect(recipeModel.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toEqual({ message: "Recipe edited successfully" });
    });
  });
});