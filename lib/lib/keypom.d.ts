import { WalletModuleFactory, InjectedWallet } from "@near-wallet-selector/core";
import icon from "./icon";
export { icon };
declare global {
    interface Window {
        near: any;
    }
}
export interface KeypomParams {
    iconUrl?: string;
    deprecated?: boolean;
    desiredUrl?: string;
}
export declare function setupKeypom({ iconUrl, deprecated, desiredUrl, }?: KeypomParams): WalletModuleFactory<InjectedWallet>;
