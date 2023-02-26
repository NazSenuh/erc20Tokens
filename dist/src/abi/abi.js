"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minABI = void 0;
exports.minABI = [
    // balanceOf
    {
        constant: true,
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        type: "function",
    },
];
