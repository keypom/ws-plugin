import { WalletModuleFactory, InjectedWallet } from "@near-wallet-selector/core";
declare global {
    interface Window {
        near: any;
    }
}
export interface KeypomParams {
    iconUrl?: string;
    deprecated?: boolean;
}
export declare function setupKeypom({ iconUrl, deprecated, }?: KeypomParams): WalletModuleFactory<InjectedWallet>;
