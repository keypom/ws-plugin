const fs = require('fs');
const test = require('ava');
const BN = require('bn.js');
const { parseSeedPhrase } = require('near-seed-phrase');
const nearAPI = require('near-api-js');
require('dotenv').config()

/// imports and config
const {
	KeyPair,
	Account,
	transactions: { deployContract, functionCall },
	utils: {
		PublicKey,
		format: { parseNearAmount }
	}
} = nearAPI;
const {
	getAccount, init,
	recordStart, recordStop,
	contractAccount,
	accountExists,
} = require('./test-utils');
const {
	connection,
	keyStore,
} = require('../utils/near-utils');
const getConfig = require("../utils/config");
const {
	networkId,
	contractId,
	gas,
	attachedDeposit,
	NEW_ACCOUNT_AMOUNT,
} = getConfig();

// const { public_key: publicKey, private_key: secretKey } = JSON.parse(fs.readFileSync('./credentials.json'))
const { publicKey, secretKey } = parseSeedPhrase(`damage miracle sick friend box among phone hand patch blossom anger salad`)
const fundingAccountId = PublicKey.from(publicKey).data.toString('hex')
console.log(fundingAccountId)
keyStore.setKey(
	networkId,
	fundingAccountId,
	KeyPair.fromString(secretKey)
);
const fundingAccount = new Account(connection, fundingAccountId)

const DELETE_EXISTING = true;
const REDEPLOY = true;
/// some vars re-used in the tests
let accountId = 'ws-plugin.testnet', account;
keyStore.setKey(
	networkId,
	accountId,
	KeyPair.fromString(secretKey)
);

const RECEIVER_HEADER = '|kR|'
const ACTION_HEADER = '|kA|'
const PARAM_START = '|kP|'
const PARAM_STOP = '|kS|'

const wrapParams = (params, newParams = {}) => {
	Object.entries(params).forEach(([k, v]) => {
		if (Array.isArray(v)) v = v.join()
		newParams[PARAM_START + k] = v + PARAM_STOP
	})
	return newParams
}

const genArgs = (json) => {
	const newJson = {
		transactions: []
	}
	json.transactions.forEach((tx) => {
		const newTx = {}
		newTx[RECEIVER_HEADER] = tx.contractId
		newTx.actions = []
		tx.actions.forEach((action) => {
			const newAction = {}
			newAction[ACTION_HEADER] = action.type
			// newAction.params = action.params
			newAction.params = wrapParams(action.params)
			newTx.actions.push(newAction)
		})
		newJson.transactions.push(newTx)
	})
	return newJson
}

/** 
 * this test just sets up the NEAR account
 */
test('implicit account setup', async (t) => {

	const contractBytes = fs.readFileSync('./out/main.wasm');
	account = new Account(connection, accountId)
	account.viewFunction2 = ({ contractId, methodName, args }) => account.viewFunction(
		contractId,
		methodName,
		args
	);

	if (DELETE_EXISTING) {
		let skip = false
		try {
			await account.state()
		} catch (e) {
			skip = true
		}
		if (!skip) {
			await account.deleteAccount(fundingAccountId)
		}

		await fundingAccount.functionCall({
			contractId: 'testnet',
			methodName: 'create_account',
			args: {
				new_account_id: accountId,
				new_public_key: publicKey,
			},
			attachedDeposit: parseNearAmount('1'),
			gas,
		})

		const actions = [
			deployContract(contractBytes),
			functionCall(
				'setup',
				wrapParams({
					contracts: ['testnet', 'beta.keypom.testnet'],
					amounts: [parseNearAmount('1'), parseNearAmount('0.1')],
					methods: ['claim:create_account:create_account_and_claim', 'create_drop:delete_keys'],
					funder: fundingAccountId,
					repay: parseNearAmount('0.5'),
					floor: parseNearAmount('0.92'),
				}),
				gas,
			),
		];
		await account.signAndSendTransaction({ receiverId: accountId, actions });
	}

	if (REDEPLOY) {
		const actions = [
			deployContract(contractBytes),
		];
		await account.signAndSendTransaction({ receiverId: accountId, actions });
	}

	t.true(true);
});



/** 
 * testing view method of contract
 */
test('get_rules', async (t) => {
	const res = await account.viewFunction2({
		contractId: accountId,
		methodName: 'get_rules',
	})
	console.log('get_rules', res);

	t.true(true);
});

test('get key information before execute', async (t) => {

	const res = await account.viewFunction2({
		contractId: accountId,
		methodName: 'get_key_information',
		args: {
			blah: true
		}
	});

	console.log(res)

	t.true(true);
});

test('exit before execute (fails due to floor)', async (t) => {
	const keys = await account.getAccessKeys();

	try {
		await account.functionCall({
			contractId: accountId,
			methodName: 'create_account_and_claim',
			args: {
				new_account_id: accountId,
				new_public_key: keys[0].public_key,
			}
		});
		t.true(false);
	} catch (e) {
		t.true(true);
	}
});


/** 
 * testing execute basic tx
 * 
 * ALL TRANSACTIONS MUST FOLLOW:
 * https://github.com/near/wallet-selector/blob/main/packages/core/src/lib/wallet/transactions.types.ts
 * 
 * AND BE STRUCTURED
 * 
 args: {
	transactions: [{
		contractId: fundingAccountId,
		actions: [
			{
				type: 'Transfer',
				params: {
					deposit: '1'
				}
			}
		]
	}]
}
 */
test('execute', async (t) => {
	const res = await fundingAccount.functionCall({
		contractId: accountId,
		methodName: 'execute',
		args: genArgs({
			transactions: [
				// {
				// 	contractId: fundingAccountId,
				// 	actions: [
				// 		{
				// 			type: 'Transfer',
				// 			params: {
				// 				deposit: '1'
				// 			}
				// 		},
				// 		{
				// 			type: 'Transfer',
				// 			params: {
				// 				deposit: '1'
				// 			}
				// 		}
				// 	],
				// },
				{
					contractId: 'testnet',
					actions: [
						// {
						// 	type: 'Transfer',
						// 	params: {
						// 		deposit: '1'
						// 	}
						// },
						{
							type: 'FunctionCall',
							params: {
								methodName: 'create_account',
								args: JSON.stringify({
									new_account_id: 'mnbv-' + Date.now().toString().padEnd(64 - 26, '0') + '.testnet',
									new_public_key: publicKey.toString(),
								}),
								deposit: parseNearAmount('0.02'),
								gas: '30000000000000',
							}
						}
					],
				}
			]
		}),
		gas: new BN('80000000000000'),
	})
	// console.log('execute', res);

	t.true(true);
});


/** 
 * testing view method of contract
 */
test('get_floor', async (t) => {
	const res = await account.viewFunction2({
		contractId: accountId,
		methodName: 'get_floor',
	})
	console.log('get_floor', res);

	t.true(true);
});

test('get key information after execute', async (t) => {

	const res = await account.viewFunction2({
		contractId: accountId,
		methodName: 'get_key_information',
		args: {
			blah: true
		}
	});

	console.log(res)

	t.true(true);
});

test('exit after execute', async (t) => {

	const keys = await account.getAccessKeys();

	await account.functionCall({
		contractId: accountId,
		methodName: 'create_account_and_claim',
		args: {
			new_account_id: accountId,
			new_public_key: keys[0].public_key,
		}
	});

	t.true(true);
});