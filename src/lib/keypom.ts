import {
	WalletModuleFactory,
	InjectedWallet,
	Action,
	FunctionCallAction,
	WalletBehaviourFactory,
	waitFor,
	FinalExecutionOutcome,
} from "@near-wallet-selector/core";

import { autoSignIn, initConnection, getAccount, signIn, signOut, isSignedIn, signAndSendTransactions, parseUrl, viewMethod, claimTrialAccount, getEnv, getLocalStorageKeypomEnv, setLocalStorageKeypomEnv, switchAccount } from './keypom-lib' 
import icon from "./icon";

export { icon };


declare global {
	interface Window {
		near: any,
	}
}

export interface KeypomParams {
	iconUrl?: string;
	deprecated?: boolean;
	desiredUrl?: string;
}

const Keypom: WalletBehaviourFactory<InjectedWallet> = async ({
	options,
	metadata,
	store,
	provider,
	emitter,
	logger,
}) => {
	console.log("IM AUTO SIGNING IN")
	const envExists = getLocalStorageKeypomEnv();
	
	const validUrl = parseUrl("/keypom-url/");

	console.log('validUrl: ', validUrl)
	if (validUrl && !envExists) {
		claimTrialAccount(emitter);
		autoSignIn();
		setLocalStorageKeypomEnv();
	}
	
	initConnection(options.network, logger)

	const isValidActions = (actions: Array<Action>): actions is Array<FunctionCallAction> => {
		return actions.every((x) => x.type === "FunctionCall");
	};

	const transformActions = (actions: Array<Action>) => {
		const validActions = isValidActions(actions);

		if (!validActions) {
			throw new Error(`Only 'FunctionCall' actions types are supported by ${metadata.name}`);
		}

		return actions.map((x) => x.params);
	};

	// return the wallet interface for wallet-selector
	return {
		get networkId() {
			const {networkId} = getEnv();
			return networkId;
		},

		async account() {
			logger.log("Keypom:account");
			const {account} = getEnv();
			return account;
		},

		async switchAccount(id) {
			switchAccount(id);
		},

		async getAccountId() {
			logger.log("Keypom:getAccountId");
			const {accountId} = getEnv();
			return accountId;
		},

		async isSignedIn() {
			logger.log("Keypom:isSignedIn");
			const res = isSignedIn();
			return res;
		},
		
		async signIn() {
			logger.log("Keypom:signIn");
			const account = await signIn();
			return [account];
		},

		async signOut() {
			logger.log("Keypom:signOut");
			const res = signOut()
			return res
		},

		async verifyOwner({ message }) {
			logger.log("Keypom:verifyOwner", { message });

			return {
				accountId: 'string',
				message: 'string',
				blockId: 'string',
				publicKey: 'string',
				signature: 'string',
				keyType: 0,
			}
		},

		async getAccounts() {
			const { accountId } = await getAccount();
			return [{ accountId }];
		},

		async signAndSendTransaction({ receiverId, actions }) {
			logger.log("Keypom:signAndSendTransaction", {
				receiverId,
				actions,
			});

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
		},

		async signAndSendTransactions({ transactions }) {
			logger.log("Keypom:signAndSendTransactions", { transactions });

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
		},
	};
};	

export function setupKeypom({
	iconUrl = icon,
	deprecated = false,
	desiredUrl,
}: KeypomParams = {}): WalletModuleFactory<InjectedWallet> {
	return async () => {
		// await waitFor(() => !!window.near?.isSignedIn(), { timeout: 300 }).catch(() => false);
		
		return {
			id: "keypom",
			type: "injected",
			metadata: {
				name: "Keypom Account",
				description: null,
				iconUrl,
				downloadUrl:
					"https://example.com",
				deprecated,
				available: true,
			},
			init: Keypom,
		};
	};
}
