"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenRouter = void 0;
const token_controller_1 = require("../Controllers/token.controller");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', token_controller_1.tokenController.getErc20.bind(token_controller_1.tokenController));
exports.tokenRouter = router;
