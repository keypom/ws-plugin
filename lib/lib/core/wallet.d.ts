import { Account } from "near-api-js";
import { KeypomWalletProtocol } from "./types";
import BN from "bn.js";
import { FinalExecutionOutcome } from "@near-wallet-selector/core";
export declare class KeypomWallet implements KeypomWalletProtocol {
    readonly networkId: string;
    private readonly near;
    private readonly connection;
    private readonly desiredUrl;
    private accountId?;
    private secretKey?;
    private keypomContractId?;
    private publicKey?;
    private keyPair?;
    constructor({ networkId, desiredUrl }: {
        networkId?: string | undefined;
        desiredUrl?: string | undefined;
    });
    transformTransactions: (txns: any) => Promise<any[]>;
    parseUrl: () => boolean;
    tryInitFromLocalStorage(data: any): boolean;
    assertSignedIn(): void;
    isSignedIn(): Promise<boolean>;
    verifyOwner(): Promise<void>;
    signOut(): Promise<void>;
    getAvailableBalance(id?: string): Promise<BN>;
    getAccounts(): Promise<Account[]>;
    getAccountId(): string;
    switchAccount(id: string): Promise<void>;
    signIn(): Promise<Account[]>;
    signAndSendTransaction(params: any): Promise<FinalExecutionOutcome>;
    signAndSendTransactions(params: any): Promise<FinalExecutionOutcome[]>;
}
