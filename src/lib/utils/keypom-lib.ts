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
import { setupKeypomModal } from "../modals/modal";

const gas = '200000000000000'

export const networks = {
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

export const KEYPOM_LOCAL_STORAGE_KEY = 'keypom-wallet-selector';

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

export const getLocalStorageKeypomEnv = (): boolean => {
	const localStorageDataJson = localStorage.getItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`);
	console.log('localStorageDataJson: ', localStorageDataJson)
	if (!localStorageDataJson) {
		return false;
	}

	const localStorageData = JSON.parse(localStorageDataJson);

	accountId = localStorageData.accountId;
	networkId = localStorageData.networkId;
	secretKey = localStorageData.secretKey;
	keypomContractId = localStorageData.keypomContractId
	keyPair = KeyPair.fromString(secretKey)
	console.log('Setting keyPair in get: ', keyPair)
	publicKey = PublicKey.fromString(keyPair.publicKey.toString())

	return true;
}

export const setLocalStorageKeypomEnv = () => {
	const dataToWrite = JSON.stringify({
		accountId,
		networkId,
		secretKey,
		keypomContractId,
	});
	console.log('dataToWrite: ', dataToWrite)

	localStorage.setItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`, dataToWrite);
}

const onSubmitAccountId = async (accountId: string) => {
	console.log("waiting 2 seconds");
	// wait 2 seconds
	await new Promise((resolve) => setTimeout(resolve, 2000));
	console.log('accountId Submitted From Form: ', accountId)
}

export const claimTrialAccount = async () => {
	let isTrialClaimed = false;
	try {
		const dropInfo = await viewMethod({
			contractId: keypomContractId, 
			methodName: 'get_drop_information', 
			args: {
				key: keyPair.publicKey.toString()
			}
		});
		console.log('dropInfo: ', dropInfo)
	} catch(e: any) {
		if (e.toString().includes("no drop ID for PK")) {
			console.log(`trial is claimed (error: ${e})`);
			isTrialClaimed = true;
		} else {
			console.log("error", e);
		}
	}

	const modal = setupKeypomModal({
		title: "this is my title (3)",
		description: "this is my dasdasdasdescription",
	}, onSubmitAccountId);
	
	modal.show();

	let newAccountId = `test-1676383642371.linkdrop-beta.keypom.testnet`;
	// if(!isTrialClaimed) {
		// 	const desiredAccountId = window.prompt("Enter a desired account ID");
		// 	console.log('desiredAccountId: ', desiredAccountId)
		// 	newAccountId = `${desiredAccountId}.linkdrop-beta.keypom.testnet`
	// } else {
	// 	const desiredAccountId = window.prompt("Enter an existing account", `test-1676383642371`);
	// 	console.log('desiredAccountId: ', desiredAccountId)
	// 	newAccountId = `${desiredAccountId}.linkdrop-beta.keypom.testnet`
	// }
	
	console.log('isTrialClaimed: ', isTrialClaimed)
	accountId = newAccountId;
	console.log('newAccountId: ', newAccountId)
}

export const parseUrl = (desiredUrl): boolean => {
	/// TODO validation
	desiredUrl = desiredUrl || '/keypom-trial/';
	const split = window.location.href.split(desiredUrl);

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

	keypomContractId = trialKeypomContract;
	networkId = trialKeypomContract.split('keypom.testnet').length > 1 ? 'testnet' : 'mainnet';
	secretKey = trialSecretKey
	keyPair = KeyPair.fromString(trialSecretKey)
	console.log('setting keyPair in parse: ', keyPair)
	publicKey = PublicKey.fromString(keyPair.publicKey.toString())
	
	console.log('secretKey: ', secretKey)

	return true
}

export const autoSignIn = () => {
	console.log('secretKey: ', secretKey)

	localStorage.setItem(`near-api-js:keystore:${accountId}:testnet`, `ed25519:${secretKey}`)
	
	// Contract
	localStorage.setItem('near-wallet-selector:contract', "{\"contractId\":\"testnet\",\"methodNames\":[]}")
	localStorage.setItem('near-wallet-selector:contract:pending', "{\"contractId\":\"testnet\",\"methodNames\":[]}")

	// Selected Wallet
	localStorage.setItem('near-wallet-selector:selectedWalletId', "\"keypom\"")
	localStorage.setItem('near-wallet-selector:selectedWalletId:pending', "\"keypom\"")
	
	// let recentWallets = localStorage.get('near-wallet-selector:recentlySignedInWallets');

	// console.log('recentWallets: ', recentWallets)
	// if (recentWallets) {
	// 	recentWallets.push(autoAccountId);
	// }
	// localStorage.setItem('near-wallet-selector:recentlySignedInWallets', JSON.stringify(["keypom"]))
	// localStorage.setItem('near-wallet-selector:recentlySignedInWallets:pending', JSON.stringify(["keypom"]))
}

export const getAccount = async () => ({ accountId });
export const signIn = async () => {console.log("i am signing in lol"); return account};
export const signOut = () => { 
	
};
export const switchAccount = (id) => { 
	logger.log("Keypom:switchAccount");
	accountId = id;
	console.log('switching accountId: ', accountId)
	setLocalStorageKeypomEnv();
};

export const isSignedIn = () => { 
	console.log('is signed in: accountId: ', accountId)
	return accountId != undefined && accountId != null
};

export const signAndSendTransactions = async ({ transactions }: {transactions: Array<{receiverId?: string, actions: Action[]}>}) => {
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

	const promises = transformedTransactions.map((tx) => account.signAndSendTransaction(tx));
	return await Promise.all(promises)
	
};

export const isValidActions = (actions: Array<Action>): actions is Array<FunctionCallAction> => {
	return actions.every((x) => x.type === "FunctionCall");
};

export const transformActions = (actions: Array<Action>) => {
	const validActions = isValidActions(actions);

	if (!validActions) {
		throw new Error(`Only 'FunctionCall' actions types are supported`);
	}

	return actions.map((x) => x.params);
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
	console.log('args: ', args)
	console.log('methodName: ', methodName)
	console.log('contractId: ', contractId)
	const nodeUrl = networks[networkId].nodeUrl;
	console.log('nodeUrl: ', nodeUrl)
	const provider = new nearAPI.providers.JsonRpcProvider({ url: nodeUrl });

	let res: any = await provider.query({
		request_type: 'call_function',
		account_id: contractId,
		method_name: methodName,
		args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
		finality: 'optimistic',
	});
	
	return JSON.parse(Buffer.from(res.result).toString());
}