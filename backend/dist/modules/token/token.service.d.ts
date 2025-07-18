import { PrismaClient } from '@prisma/client';
import { TokenCreateDTO, TokenUpdateDTO, TokenPublicDTO, TokenListQuery } from './token.types.js';
import { SmartContractService } from '../smart-contract/smartContract.service.js';
export declare class TokenService {
    private prisma;
    private smartContractService;
    constructor(prisma: PrismaClient, smartContractService?: SmartContractService);
    private getSmartContractService;
    create(dto: TokenCreateDTO): Promise<TokenPublicDTO>;
    getAll(query?: TokenListQuery): Promise<TokenPublicDTO[]>;
    getById(id: string): Promise<TokenPublicDTO | null>;
    getTokenBalanceFromBlockchain(contractAddress: string, walletAddress: string): Promise<string>;
    getTokenMetadataFromBlockchain(contractAddress: string): Promise<any>;
    update(id: string, dto: TokenUpdateDTO): Promise<TokenPublicDTO | null>;
    delete(id: string): Promise<boolean>;
    getAllPublic(): Promise<TokenPublicDTO[]>;
}
//# sourceMappingURL=token.service.d.ts.map