import {
	WalletModuleFactory,
	InjectedWallet,
	Action,
	FunctionCallAction,
	WalletBehaviourFactory,
	waitFor,
	FinalExecutionOutcome,
} from "@near-wallet-selector/core";

import { autoSignIn, initConnection, getAccount, signIn, signOut, signAndSendTransactions } from './keypom-lib' 
import { nearWalletIcon } from "../assets/icons";

declare global {
	interface Window {
		near: any,
	}
}

export interface KeypomParams {
	iconUrl?: string;
	deprecated?: boolean;
}

const Keypom: WalletBehaviourFactory<InjectedWallet> = async ({
	options,
	metadata,
	store,
	provider,
	emitter,
	logger,
}) => {

	initConnection(options.network)

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
		async signIn() {
			const account = await signIn();
			return [account];
		},

		async signOut() {
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
				res = signAndSendTransactions({
					transactions: [
						{
							receiverId,
							actions: transformActions(actions),
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
	iconUrl = nearWalletIcon,
	deprecated = false,
}: KeypomParams = {}): WalletModuleFactory<InjectedWallet> {
	return async () => {

		await autoSignIn()

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
