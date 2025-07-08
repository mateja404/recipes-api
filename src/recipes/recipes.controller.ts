import { Controller, Body, Post, Get, Delete, UseGuards, Param, Patch, Req } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { IpBanGuard } from 'src/guards/ip.guard';
import { PrivilageGuard } from 'src/guards/privilage.guard';
import { CreateRecipeDto, PatchRecipeDto } from './dto/recipe.dto';
import { Types } from 'mongoose';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) {}

    @UseGuards(AuthGuard, IpBanGuard)
    @Get('/getallrecipes')
    getAllRecipes() {
        return this.recipesService.getAllRecipes();
    }

    @UseGuards(AuthGuard, IpBanGuard, PrivilageGuard)
    @Delete('/deleterecipe/:id')
    async deleteRecipeById(@Param('id') recipeId: Types.ObjectId, @Req() req: RequestWithUser): Promise<{ message }> {
        const authenticatedUserId = req.user.sub;
        return this.recipesService.deleteRecipeById(new Types.ObjectId(authenticatedUserId), recipeId);
    }

    @UseGuards(AuthGuard, IpBanGuard)
    @Post('/createrecipe')
    createRecipe(@Body() dto: CreateRecipeDto, @Req() req: RequestWithUser) {
        const userId = req.user.sub;
        return this.recipesService.createRecipe(new Types.ObjectId(userId), dto.title, dto.recipeText);
    }

    @UseGuards(AuthGuard, IpBanGuard, PrivilageGuard)
    @Patch('/patchrecipe/:id')
    updateRecipe(@Param('id') id: Types.ObjectId, @Req() req: RequestWithUser , @Body() dto: PatchRecipeDto,) {
        const userId = new Types.ObjectId(req.user.sub);
        return this.recipesService.patchRecipe(id, userId, dto.title, dto.recipeText);
    }
}