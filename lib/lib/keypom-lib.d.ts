import { Action } from "@near-wallet-selector/core";
export declare const getEnv: () => {
    networkId: any;
    accountId: any;
    account: any;
    secretKey: any;
    publicKey: any;
    keyPair: any;
    keypomContractId: any;
};
export declare const getLocalStorageKeypomEnv: () => boolean;
export declare const setLocalStorageKeypomEnv: () => void;
export declare const claimTrialAccount: () => Promise<void>;
export declare const parseUrl: (desiredUrl: any) => boolean;
export declare const autoSignIn: () => void;
export declare const initConnection: (network: any, logFn: any) => void;
export declare const getAccount: () => Promise<{
    accountId: any;
}>;
export declare const signIn: () => Promise<any>;
export declare const signOut: () => void;
export declare const switchAccount: (id: any) => void;
export declare const isSignedIn: () => boolean;
export declare const signAndSendTransactions: ({ transactions }: {
    transactions: Array<{
        receiverId?: string;
        actions: Action[];
    }>;
}) => Promise<any[]>;
export declare const viewMethod: ({ contractId, methodName, args }: {
    contractId: any;
    methodName: any;
    args?: {} | undefined;
}) => Promise<any>;
