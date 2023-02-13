import * as nearAPI from "near-api-js";
const {
	Near,
	Account,
	KeyPair,
	keyStores: { BrowserLocalStorageKeyStore },
	transactions: { addKey, deleteKey, functionCallAccessKey },
	utils,
	transactions: nearTransactions,
	utils: {
		PublicKey,
		format: { parseNearAmount, formatNearAmount },
	},
} = nearAPI;

import { genArgs } from "./keypom-v2-utils";

import { BN } from "bn.js";
import { AddKeyPermission, Action } from "@near-wallet-selector/core";

const gas = '200000000000000'

const networks = {
	mainnet: {
		networkId: 'mainnet',
		nodeUrl: 'https://rpc.mainnet.near.org',
		walletUrl: 'https://wallet.near.org',
		helperUrl: 'https://helper.mainnet.near.org'
	},
	testnet: {
		networkId: 'testnet',
		nodeUrl: 'https://rpc.testnet.near.org',
		walletUrl: 'https://wallet.testnet.near.org',
		helperUrl: 'https://helper.testnet.near.org'
	}
}

const KEYPOM_LOCAL_STORAGE_KEY = 'keypom-wallet-selector';

let near, connection, logger, account, accountId, networkId, keyPair, secretKey, publicKey, keypomContractId;

export const getEnv = () => {
	return {
		networkId,
		accountId,
		account,
		secretKey,
		publicKey,
		keyPair,
		keypomContractId,
	}
}

export const getLocalStorageKeypomEnv = () => {
	const localStorageAccountId = localStorage.getItem(`${KEYPOM_LOCAL_STORAGE_KEY}:accountId`);
	if (!localStorageAccountId) {
		return;
	}

	accountId = localStorageAccountId;
	networkId = localStorage.getItem(`${KEYPOM_LOCAL_STORAGE_KEY}:networkId`);
	secretKey = localStorage.getItem(`${KEYPOM_LOCAL_STORAGE_KEY}:secretKey`);
	keypomContractId = localStorage.getItem(`${KEYPOM_LOCAL_STORAGE_KEY}:keypomContractId`);
	keyPair = KeyPair.fromString(secretKey)
	publicKey = PublicKey.fromString(keyPair.publicKey.toString())
}

export const setLocalStorageKeypomEnv = () => {
	localStorage.setItem(`${KEYPOM_LOCAL_STORAGE_KEY}:accountId`, accountId);
	localStorage.setItem(`${KEYPOM_LOCAL_STORAGE_KEY}:networkId`, networkId);
	localStorage.setItem(`${KEYPOM_LOCAL_STORAGE_KEY}:secretKey`, secretKey);
	localStorage.setItem(`${KEYPOM_LOCAL_STORAGE_KEY}:keypomContractId`, keypomContractId);
}

export const claimTrialAccount = async () => {
	let newAccountId = `keypom-trial-${Date.now()}.linkdrop-beta.keypom.testnet`;
	newAccountId = `test-1676298422580.linkdrop-beta.keypom.testnet`;

	accountId = newAccountId;
}

export const parseUrl = (): boolean => {
	/// TODO validation
	const split = window.location.href.split('/keypom-trial/');

	if (split.length < 2) {
		return false;
	}
	
	const trialInfo = split[1];
	const 	[keypomContractId, trialSecretKey] = trialInfo.split('#')
	console.log('trialSecretKey: ', trialSecretKey)
	console.log('keypomContractId: ', keypomContractId)

	if (!keypomContractId || !trialSecretKey) {
		return false;
	}

	networkId = keypomContractId.split('keypom.testnet').length > 1 ? 'testnet' : 'mainnet';
	secretKey = trialSecretKey
	keyPair = KeyPair.fromString(trialSecretKey)
	publicKey = PublicKey.fromString(keyPair.publicKey.toString())
	
	console.log('secretKey: ', secretKey)

	return true
}


export const autoSignIn = () => {
	console.log('secretKey: ', secretKey)

	localStorage.setItem(`near-api-js:keystore:${accountId}:testnet`, `ed25519:${secretKey}`)
	
	// Contract
	//localStorage.setItem('near-wallet-selector:contract', "{\"contractId\":\"testnet\",\"methodNames\":[]}")
	localStorage.setItem('near-wallet-selector:contract:pending', "{\"contractId\":\"testnet\",\"methodNames\":[]}")

	// Selected Wallet
	//localStorage.setItem('near-wallet-selector:selectedWalletId', "\"keypom\"")
	localStorage.setItem('near-wallet-selector:selectedWalletId:pending', "\"keypom\"")
	
	// let recentWallets = localStorage.get('near-wallet-selector:recentlySignedInWallets');

	// console.log('recentWallets: ', recentWallets)
	// if (recentWallets) {
	// 	recentWallets.push(autoAccountId);
	// }
	//localStorage.setItem('near-wallet-selector:recentlySignedInWallets', JSON.stringify(["keypom"]))
	localStorage.setItem('near-wallet-selector:recentlySignedInWallets:pending', JSON.stringify(["keypom"]))
}

export const initConnection = (network, logFn?) => {
	networkId = network.networkId
	network = networks[networkId]
	const keyStore = new BrowserLocalStorageKeyStore()

	keyStore.setKey(networkId, accountId, keyPair)

	near = new Near({
		...network,
		deps: { keyStore },
	});

	connection = near.connection;
	account = new Account(connection, accountId)
};

export const getAccount = async () => ({ accountId });
export const signIn = async () => account;
export const signOut = () => { };
export const isSignedIn = () => { 
	console.log('accountId: ', accountId)
	return accountId != undefined && accountId != null
};

export const signAndSendTransactions = async ({ transactions }: {transactions: Array<{receiverId?: string, actions: Action[]}>}) => {
	console.log('transactions: ', transactions)
	if (!account) {
		throw new Error("Wallet not signed in");
	}

	const args = genArgs({ transactions })
	console.log('args: ', args)

	const transformedTransactions = await transformTransactions([{
		receiverId: accountId,
		actions: [{
			type: 'FunctionCall',
			params: {
				methodName: 'execute',
				args,
				gas: '100000000000000',
			}
		}]
	}])

	console.log('transformedTransactions: ', transformedTransactions)
	const promises = transformedTransactions.map((tx) => account.signAndSendTransaction(tx));
	console.log('promises: ', promises)
	return await Promise.all(promises)
	
};

const transformTransactions = async (
    transactions
) => {
    const { networkId, signer, provider } = account.connection;

    return Promise.all(
      transactions.map(async (transaction, index) => {
        const actions = transaction.actions.map((action) =>
          createAction(action)
        );

        const block = await provider.block({ finality: "final" });

        return nearTransactions.createTransaction(
          account.accountId,
          publicKey,
          transaction.receiverId,
          publicKey.nonce + index + 1,
          actions,
          utils.serialize.base_decode(block.header.hash)
        );
      })
    );
  };


const createAction = (action) => {
	switch (action.type) {
	  case "CreateAccount":
		return nearTransactions.createAccount();
	  case "DeployContract": {
		const { code } = action.params;
  
		return nearTransactions.deployContract(code);
	  }
	  case "FunctionCall": {
		const { methodName, args, gas, deposit } = action.params;
  
		return nearTransactions.functionCall(
		  methodName,
		  args,
		  new BN(gas),
		  new BN(deposit)
		);
	  }
	  case "Transfer": {
		const { deposit } = action.params;
  
		return nearTransactions.transfer(new BN(deposit));
	  }
	  case "Stake": {
		const { stake, publicKey } = action.params;
  
		return nearTransactions.stake(new BN(stake), utils.PublicKey.from(publicKey));
	  }
	  case "AddKey": {
		const { publicKey, accessKey } = action.params;
  
		// return nearTransactions.addKey(
		//   utils.PublicKey.from(publicKey),
		//   // TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
		//   getAccessKey(accessKey.permission)
		// );
	  }
	  case "DeleteKey": {
		const { publicKey } = action.params;
  
		return nearTransactions.deleteKey(utils.PublicKey.from(publicKey));
	  }
	  case "DeleteAccount": {
		const { beneficiaryId } = action.params;
  
		return nearTransactions.deleteAccount(beneficiaryId);
	  }
	  default:
		throw new Error("Invalid action type");
	}
  };

// Make a read-only call to retrieve information from the network
export const viewMethod = async ({ contractId, methodName, args = {} }) => {
	const provider = new nearAPI.providers.JsonRpcProvider({ url: networks[networkId].nodeUrl });

	let res = await provider.query({
		request_type: 'call_function',
		account_id: contractId,
		method_name: methodName,
		args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
		finality: 'optimistic',
	});
	console.log('res: ', res)
	
	//return JSON.parse(Buffer.from(res.result).toString());
}