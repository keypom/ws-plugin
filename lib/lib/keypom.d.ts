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
}
export declare function setupKeypom({ iconUrl, deprecated, }?: KeypomParams): WalletModuleFactory<InjectedWallet>;
