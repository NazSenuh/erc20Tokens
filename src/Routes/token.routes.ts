import {tokenController} from "../Controllers/token.controller";

import {Router} from "express";
const router =  Router();


router.get('/', tokenController.getErc20.bind(tokenController))

export const tokenRouter = router