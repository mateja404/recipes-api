import { Controller, Body, Post, Get, Delete, UseGuards, Param, Patch, Req } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { IpBanGuard } from 'src/guards/ip.guard';
import { PrivilageGuard } from 'src/guards/privilage.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateRecipeDto, PatchRecipeDto } from './dto/recipe.dto';
import { Types } from 'mongoose';
import { Role } from 'src/decorators/roles.decorator';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) {}

    @UseGuards(AuthGuard, IpBanGuard)
    @Get('/getallrecipes')
    getallRecipes() {
        return this.recipesService.getAllRecipes();
    }

    @UseGuards(AuthGuard, IpBanGuard, PrivilageGuard)
    @Delete('/deleterecipe/:id')
    async deleteRecipe(@Param('id') recipeId: Types.ObjectId, @Req() req: RequestWithUser,) {
        const authenticatedUserId = req.user.sub;
        return this.recipesService.deleteRecipeById(new Types.ObjectId(authenticatedUserId), recipeId);
    }

    @UseGuards(AuthGuard, IpBanGuard)
    @Roles(Role.Cook)
    @Post('/createrecipe')
    createRecipe(@Body() dto: CreateRecipeDto) {
        return this.recipesService.createRecipe(dto.userId, dto.title, dto.recipeText);
    }

    @UseGuards(AuthGuard, IpBanGuard, PrivilageGuard)
    @Patch('/patchrecipe/:id')
    async updateRecipe(@Param('id') id: Types.ObjectId, @Body() dto: PatchRecipeDto,) {
    return this.recipesService.patchRecipe(id, dto.userId, dto.title, dto.recipeText);
    }
}