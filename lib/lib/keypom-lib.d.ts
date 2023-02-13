import { Action } from "@near-wallet-selector/core";
export declare const autoSignIn: () => Promise<void>;
export declare const initConnection: (network: any, logFn?: any) => void;
export declare const getAccount: () => Promise<{
    accountId: any;
}>;
export declare const signIn: () => Promise<any>;
export declare const signOut: () => void;
export declare const isSignedIn: () => boolean;
export declare const signAndSendTransactions: ({ transactions }: {
    transactions: Array<{
        receiverId?: string;
        actions: Action[];
    }>;
}) => Promise<any[]>;
