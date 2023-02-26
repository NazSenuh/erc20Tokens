import { Request, Response} from "express";
import Web3 from 'web3';
import axios from 'axios';
import { AbiItem} from "web3-utils";
import fs from 'fs/promises'
import path from 'path'
import Cron from 'node-cron'

import {IToken, IResponse} from '../types/token.types'
import * as config from "../../config.json"
import {minABI} from '../abi/abi'
const Web3Client = new Web3(new Web3.providers.HttpProvider(config.networkUri));



class TokenController  {
    web3: Web3;

    constructor(url:string) {
        this.web3 = new Web3(url);
    }

    async getAllTokenBalances(tokenList:IToken[], wallet:string): Promise<IResponse[]> {
            let proms: IResponse[] = []

                for (let i = 0; i < tokenList.length; i++) {
                    try {
                        const {name, address} = tokenList[i]

                        let contract = new Web3Client.eth.Contract(minABI as AbiItem[] , address)
                        let balance:string|null

                        try {
                             balance = await contract.methods.balanceOf(wallet).call()
                        }catch (e) {
                            balance = null
                        }
                        console.log(balance)

                        if (Number(balance)) {
                            proms.push({name, balance});
                        }

                    } catch (e:any) {
                        throw new Error(e.message)
                    }
                }
        return proms;
    }

    async getTokens(chain:string): Promise<IToken[]> {
        try {
            const res = await axios.get(chain)
            const erc20Tokens = res.data.filter(token => token.platforms && token.platforms.ethereum);
            const contractAddresses = erc20Tokens.map(token => {return {name:token.name, address: token.platforms.ethereum}});

            return contractAddresses
        } catch (e: any) {
            throw new Error(e.message)
        }

    }

    async getErc20(req: Request,res:Response){
        try {
            const data = await this.erc20()
            Cron.schedule('60 * * * * *', res.send(data))


        }catch (e) {
            res.status(500).json({message: e.message})
        }
    }

    async erc20() {
        try {
            const allTokens = await this.getTokens(config.API)
            const data = await this.getAllTokenBalances(allTokens, config.wallet)

            const fileData = await fs.writeFile(path.join(__dirname, '..', 'data.json'), JSON.stringify({data, time:new Date()}))
            return  fileData
        } catch (e: any){
            throw new Error(e.message)
        }
    }
}

export const tokenController = new TokenController(config.networkUri)

