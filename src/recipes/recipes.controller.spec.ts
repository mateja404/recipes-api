import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { IpBanGuard } from 'src/guards/ip.guard';
import { PrivilageGuard } from 'src/guards/privilage.guard';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { Types } from 'mongoose';
import { CreateRecipeDto, PatchRecipeDto } from './dto';

// guardovi uvek prolaze
const mockGuard = {
  canActivate: jest.fn(() => true),
};

describe('RecipesController', () => {
  let controller: RecipesController;
  let service: RecipesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [
        {
          provide: RecipesService,
          useValue: {
            getAllRecipes: jest.fn(),
            deleteRecipeById: jest.fn(),
            createRecipe: jest.fn(),
            patchRecipe: jest.fn()
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockGuard)
      .overrideGuard(IpBanGuard)
      .useValue(mockGuard)
      .overrideGuard(PrivilageGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<RecipesController>(RecipesController);
    service = module.get<RecipesService>(RecipesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call recipesService.getAllRecipes', async () => {
    const getAllRecipesSpy = jest.spyOn(service, 'getAllRecipes').mockResolvedValue({ recipes: ['recipe1', 'recipe2'] });
    const recipes = await controller.getAllRecipes();
    expect(getAllRecipesSpy).toHaveBeenCalled();
    expect(recipes).toEqual({ recipes: ['recipe1', 'recipe2'] });
  });

  it('should call recipesService.deleteRecipeById', async () => {
    const deleteRecipeByIdSpy = jest.spyOn(service, 'deleteRecipeById').mockResolvedValue({ message: "Recipe deleted successfully" });
    
    const mockRequest = { user: { sub: new Types.ObjectId('60d5ec49e4e6b1001f3e7a89') } } as unknown as RequestWithUser;
    const mockRecipeId = new Types.ObjectId('60d5ec49e4e6b1001f3e7b00');
    const result = await controller.deleteRecipeById(mockRecipeId, mockRequest);

    expect(deleteRecipeByIdSpy).toHaveBeenCalled();
    expect(result).toEqual({ message: "Recipe deleted successfully" });
  });

  it('should call recipesService.createRecipe', async () => {
    const createRecipeSpy = jest.spyOn(service, 'createRecipe').mockResolvedValue({ message: "Recipe successfully created" });
    const mockRequest = { user: { sub: new Types.ObjectId('60d5ec49e4e6b1001f3e7a89') } } as unknown as RequestWithUser;
    const createRecipeDto = new CreateRecipeDto();
    createRecipeDto.title = 'aaaaaa';
    createRecipeDto.recipeText = 'culasizagas';

    const result = await controller.createRecipe(createRecipeDto, mockRequest);

    expect(createRecipeSpy).toHaveBeenCalled();
    expect(result).toEqual({ message: "Recipe successfully created" });
  });

  it('should call recipesService.patchRecipe', async () => {
    const patchRecipeSpy = jest.spyOn(service, 'patchRecipe').mockResolvedValue({ message: "Recipe edited successfully" });
    const mockRecipeId = new Types.ObjectId('60d5ec49e4e6b1001f3e7b00');
    const mockRequest = { user: { sub: new Types.ObjectId('60d5ec49e4e6b1001f3e7a89') } } as unknown as RequestWithUser;
    const patchRecipeDto = new PatchRecipeDto();
    patchRecipeDto.title = '2222222';
    patchRecipeDto.recipeText = 'nowibmwilisclass';
    patchRecipeDto.author = 'loshmiaaaaaa';

    const result = await controller.updateRecipe(mockRecipeId, mockRequest, patchRecipeDto);

    expect(patchRecipeSpy).toHaveBeenCalled();
    expect(result).toEqual({ message: "Recipe edited successfully" });
  });
});