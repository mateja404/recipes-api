import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import { Recipe, RecipeDocument } from "../schema/recipe.schema";
import { RequestWithUser } from "../common/interfaces/request-with-user.interface";

@Injectable()
export class PrivilageGuard implements CanActivate {
    constructor(@InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>, private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException("Token not found");
        }

        let payload: any;
        try {
            payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: process.env.JWT_SECRET
                }
            );
        } catch (error) {
            throw new UnauthorizedException("Invalid or expired token.");
        }

        request.user = payload;

        const editorId = payload.sub;
        const editorRole = payload.role;
        const recipeId = request.params.id;

        if (!recipeId) {
            throw new ForbiddenException("Recipe ID not provided in URL.");
        }

        const recipe = await this.recipeModel.findById(recipeId).exec();

        if (!recipe) {
            throw new ForbiddenException("Recipe not found.");
        }
        
        if (editorRole !== 'admin' && String(editorId) !== String(recipe.userId)) {
            throw new ForbiddenException("You do not have permission to modify this recipe.");
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}