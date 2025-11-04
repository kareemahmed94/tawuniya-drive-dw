import {asyncHandler} from "@/core/utils/asyncHandler";
import { Request, Response } from 'express';
import {adminService} from "@/core/di/serviceLocator";
import {ApiResponseUtil} from "@/core/utils/apiResponse";

export class AuthController {

    login = asyncHandler(async (req: Request, res: Response) => {
        const kpis = await adminService.getSystemKPIs();

        return ApiResponseUtil.success(res, kpis);
    });
}
