import { Logger } from "@near-wallet-selector/core/lib/services";
import { Account, Connection, KeyPair, Near } from "near-api-js";
import { BrowserLocalStorageKeyStore, InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { autoSignIn, claimTrialAccount, getLocalStorageKeypomEnv, KEYPOM_LOCAL_STORAGE_KEY, networks, parseUrl, setLocalStorageKeypomEnv, signAndSendTransactions } from "../utils/keypom-lib";
import { KeypomWalletProtocol } from "./types";
import BN from "bn.js";
import { Action, FinalExecutionOutcome, Transaction } from "@near-wallet-selector/core";

export class KeypomWallet implements KeypomWalletProtocol {
    readonly networkId: string;
    private readonly near: Near;
    private readonly connection: Connection;
    private readonly desiredUrl: string;

    private accountId?: string;
    private keyPair?: KeyPair;
    private secretKey?: string;
    private publicKey?: string;
    private keypomContractId?: string;
  
    public constructor({
      networkId = "mainnet",
      desiredUrl = "/keypom-trial/"
    }) {
        // Check that the desired URL starts and ends with `/`
        if (!desiredUrl.startsWith("/") && !desiredUrl.endsWith("/")) {
            throw new Error("desiredUrl must start and end with `/`");
        }

        console.log('Keypom constructor called.');
        this.networkId = networkId
        const keyStore = new BrowserLocalStorageKeyStore()
        
        this.near = new Near({
            ...networks[networkId],
            deps: { keyStore },
        });
        this.connection = this.near.connection
        this.desiredUrl = desiredUrl
    }

    public assertSignedIn() {
        if (!this.accountId) {
            throw new Error("Wallet not signed in");
        }
    }
  
    // public getAccount() {
    //     this.assertSignedIn();
    //     const accountObj = new Account(this.connection, this.accountId!);
    //     return accountObj;
    // }
  
    public async isSignedIn() {
      return this.accountId != undefined && this.accountId != null
    }

    async verifyOwner() {
        throw Error(
          "KeypomWallet:verifyOwner is deprecated"
        );
    }

    public async signOut() {
        if (this.accountId == undefined || this.accountId == null) {
            throw new Error("Wallet is already signed out");
        }

        this.accountId = this.accountId = this.keyPair = this.secretKey = this.publicKey = this.keypomContractId = undefined;
        localStorage.removeItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`);
    }

    public async getAvailableBalance(id?: string): Promise<BN> {
      // TODO: get access key allowance
        return new BN(0);
    }
  
    public async getAccounts(): Promise<Account[]> {
        if (this.accountId != undefined && this.accountId != null) {
            const accountObj = new Account(this.connection, this.accountId!);
            return [accountObj];
        }

        return []
    }
  
    public getAccountId() {
        this.assertSignedIn();
        return this.accountId!;
    }
  
    public async switchAccount(id: string) {
      // TODO:  maybe?
    }
  
    public async signIn(): Promise<Account[]> {
        console.log("IM AUTO SIGNING IN")
        const envExists = getLocalStorageKeypomEnv();
        
        const validUrl = parseUrl(this.desiredUrl);
    
        console.log('validUrl: ', validUrl)
        console.log('envExists: ', envExists)
        if (validUrl && !envExists) {
            await claimTrialAccount();
            autoSignIn();
            setLocalStorageKeypomEnv();
        }

        const accountObj = new Account(this.connection, this.accountId!);
        return [accountObj];
    }
  
    public async signAndSendTransaction(params) {
        const { receiverId, actions } = params;

        let res;
        try {
            res = await signAndSendTransactions({
                transactions: [
                    {
                        receiverId,
                        actions,
                    },
                ],
            });
        } catch (e) {
            /// user cancelled or near network error
            console.warn(e);
        }

        return res[0] as FinalExecutionOutcome;
    }
  
    public async signAndSendTransactions(params) {
        const { transactions } = params;

        let res;
        try {
            res = await signAndSendTransactions({
                transactions,
            });
        } catch (e) {
            /// user cancelled or near network error
            console.warn(e);
        }

        return res as FinalExecutionOutcome[];
    }
}