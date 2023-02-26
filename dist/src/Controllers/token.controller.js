"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenController = void 0;
const web3_1 = __importDefault(require("web3"));
const axios_1 = __importDefault(require("axios"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const node_cron_1 = __importDefault(require("node-cron"));
const config = __importStar(require("../../config.json"));
const abi_1 = require("../abi/abi");
const Web3Client = new web3_1.default(new web3_1.default.providers.HttpProvider(config.networkUri));
class TokenController {
    constructor(url) {
        this.web3 = new web3_1.default(url);
    }
    getAllTokenBalances(tokenList, wallet) {
        return __awaiter(this, void 0, void 0, function* () {
            let proms = [];
            for (let i = 0; i < tokenList.length; i++) {
                try {
                    const { name, address } = tokenList[i];
                    let contract = new Web3Client.eth.Contract(abi_1.minABI, address);
                    let balance;
                    try {
                        balance = yield contract.methods.balanceOf(wallet).call();
                    }
                    catch (e) {
                        balance = null;
                    }
                    console.log(balance);
                    if (Number(balance)) {
                        proms.push({ name, balance });
                    }
                }
                catch (e) {
                    throw new Error(e.message);
                }
            }
            return proms;
        });
    }
    getTokens(chain) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield axios_1.default.get(chain);
                const erc20Tokens = res.data.filter(token => token.platforms && token.platforms.ethereum);
                const contractAddresses = erc20Tokens.map(token => { return { name: token.name, address: token.platforms.ethereum }; });
                return contractAddresses;
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
    getErc20(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.erc20();
                node_cron_1.default.schedule('60 * * * * *', res.send(data));
            }
            catch (e) {
                res.status(500).json({ message: e.message });
            }
        });
    }
    erc20() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allTokens = yield this.getTokens(config.API);
                const data = yield this.getAllTokenBalances(allTokens, config.wallet);
                const fileData = yield promises_1.default.writeFile(path_1.default.join(__dirname, '..', 'data.json'), JSON.stringify({ data, time: new Date() }));
                return fileData;
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
}
exports.tokenController = new TokenController(config.networkUri);
