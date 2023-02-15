import { Logger } from "@near-wallet-selector/core/lib/services";
import { Account, Connection, KeyPair, Near, transactions } from "near-api-js";
import { BrowserLocalStorageKeyStore, InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { autoSignIn, claimTrialAccount, createAction, getLocalStorageKeypomEnv, KEYPOM_LOCAL_STORAGE_KEY, networks, setLocalStorageKeypomEnv } from "../utils/keypom-lib";
import { KeypomWalletProtocol, SignAndSendTransactionsParams } from "./types";
import BN from "bn.js";
import { Action, FinalExecutionOutcome, Transaction } from "@near-wallet-selector/core";
import { PublicKey } from "near-api-js/lib/utils";
import { genArgs } from "../utils/keypom-v2-utils";
import { base_decode } from "near-api-js/lib/utils/serialize";



export class KeypomWallet implements KeypomWalletProtocol {
    readonly networkId: string;
    private readonly near: Near;
    private readonly connection: Connection;
    private readonly desiredUrl: string;

    private accountId?: string;
    private secretKey?: string;
    private keypomContractId?: string;
    
    private publicKey?: PublicKey;
    private keyPair?: KeyPair;
  
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

    public transformTransactions = (txns) => {
        this.assertSignedIn();

        const account = new Account(this.connection, this.accountId!);
        const { networkId, signer, provider } = account.connection;
        
        return Promise.all(
            txns.map(async (transaction, index) => {
            const actions = transaction.actions.map((action) =>
                createAction(action)
            );
    
            const block = await provider.block({ finality: "final" });

            const accessKey: any = await provider.query(
                `access_key/${account.accountId}/${this.publicKey!}`,
                ""
            );
    
            return transactions.createTransaction(
                account.accountId,
                this.publicKey!,
                transaction.receiverId,
                accessKey.nonce + index + 1,
                actions,
                base_decode(block.header.hash)
            );
            })
        );
    }

    public parseUrl = (): boolean => {
        /// TODO validation
        const split = window.location.href.split(this.desiredUrl);
    
        if (split.length < 2) {
            return false;
        }
        
        const trialInfo = split[1];
        const 	[trialKeypomContract, trialSecretKey] = trialInfo.split('#')
        console.log('trialSecretKey: ', trialSecretKey)
        console.log('trialKeypomContract: ', trialKeypomContract)
    
        if (!trialKeypomContract || !trialSecretKey) {
            return false;
        }
    
        this.keypomContractId = trialKeypomContract;
        this.secretKey = trialSecretKey
        const keyPair = KeyPair.fromString(trialSecretKey);
        this.keyPair = keyPair
        console.log('Setting keyPair in parse URL: ', keyPair)
        this.publicKey = keyPair.getPublicKey()
    
        return true
    }

    public tryInitFromLocalStorage(data) {
        if (data?.accountId && data?.secretKey && data?.keypomContractId) {
            this.accountId = data.accountId;
            this.secretKey = data.secretKey;
            this.keypomContractId = data.keypomContractId;
            const keyPair = KeyPair.fromString(data.secretKey);
            this.keyPair = keyPair
            console.log('Setting keyPair in try init: ', keyPair)
            this.publicKey = keyPair.getPublicKey()

            return true;
        }

        return false;
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
        const returnedData = getLocalStorageKeypomEnv();
        const envExists = this.tryInitFromLocalStorage(returnedData);
        
        const validUrl = this.parseUrl();
    
        console.log('validUrl: ', validUrl)
        console.log('envExists: ', envExists)
        if (validUrl && !envExists) {
            const newAccountId = await claimTrialAccount(this.keypomContractId, this.keyPair!, networks[this.networkId].nodeUrl);
            this.accountId = newAccountId;

            autoSignIn(this.accountId!, this.secretKey!);
            const dataToWrite = {
                accountId: this.accountId,
                secretKey: this.secretKey,
                keypomContractId: this.keypomContractId,
            }
            setLocalStorageKeypomEnv(dataToWrite);
        }

        const accountObj = new Account(this.connection, this.accountId!);
        return [accountObj];
    }
  
    public async signAndSendTransaction(params) {
        this.assertSignedIn();
        const { receiverId, actions } = params;

        let res;
        try {
            res = await this.signAndSendTransactions({
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
        this.assertSignedIn();
        const { transactions } = params;
        
        const args = genArgs({ transactions })
        console.log('args: ', args)

        const account = await this.near.account(this.accountId!);

        const transformedTransactions = await this.transformTransactions([{
            receiverId: account,
            actions: [{
                type: 'FunctionCall',
                params: {
                    methodName: 'execute',
                    args,
                    gas: '100000000000000',
                }
            }]
        }])

        const promises = transformedTransactions.map((tx) => (account as any).signAndSendTransaction(tx));
        return await Promise.all(promises)as FinalExecutionOutcome[];
    }
}