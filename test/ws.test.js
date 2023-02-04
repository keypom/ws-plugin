const test = require('ava')
const { readFileSync } = require('fs')
const keypomJS = require('keypom-js')

const { initKeypom, getEnv, generateKeys, claim, createDrop, parseNearAmount } = keypomJS;

const wsCore = require("@near-wallet-selector/core");
const { setupWalletSelector } = wsCore

const DROP_ROOT = 'linkdrop-beta.keypom.testnet'
//funder
const { account_id: accountId, public_key: publicKey, private_key: secretKey } = JSON.parse(readFileSync('./credentials.json'))

/// mocking for tests
// const lsAccount = `near-api-js:keystore:${accountId}:testnet`

/// mocking for tests
const _ls = {}
window = {
	location: {
		href: 'https://example.com/#/keypom/' + process.env.TEST_ACCOUNT_PRVKEY
	},
	localStorage: {
		getItem: (k) => _ls[k],
		setItem: (k, v) => _ls[k] = v,
		removeItem: (k) => delete _ls[k],
	},
	near: {
		isSignedIn: () => true,
	}
}
localStorage = window.localStorage

// test.beforeEach((t) => {
// });

let
	networkId = 'testnet',
	contractId = 'testnet',
	selector, wallet;

test('initKeypom', async (t) => {

	await initKeypom({
		network: 'testnet',
		funder: {
			accountId,
			secretKey,
		}
	})

	const { near } = getEnv();

	t.true(!!near);
	
});


test('createDrop for trial account and claim to create trial account', async (t) => {

	const { publicKeys: newPublicKeys, secretKeys: newSecretKeys } = await generateKeys({ numKeys: 1 })

	const new_account_id = `test-${Date.now()}.${DROP_ROOT}`

	const { keys: { publicKeys, secretKeys } } = await createDrop({
		numKeys: 1,
		config: {
			dropRoot: DROP_ROOT
		},
		depositPerUseNEAR: 0.2,
		fcData: {
			methods: [[{
				receiverId: DROP_ROOT,
				methodName: 'create_account_advanced',
				attachedDeposit: parseNearAmount('0.75'),
				args: JSON.stringify({
					new_account_id,
					options: {
						contract_bytes: [...readFileSync('./out/main.wasm')],
						limited_access_keys: [{
							public_key: newPublicKeys[0],
							allowance: parseNearAmount('0.5'),
							receiver_id: new_account_id,
							method_names: 'setup,execute',
						}],
					}
				}),
			}]],
			attachedGas: '100000000000000'
		}
	})

	const res = await claim({
		accountId: 'blah',
		secretKey: secretKeys[0],
	})

	console.log(res)

	t.true(true);
	
});

// test('init', async (t) => {

// 	selector = await setupWalletSelector({
// 		network: networkId,
// 		contractId,
// 		debug: 'true',
// 		modules: [
// 			setupKeypom()
// 		],
// 		// storage: window.localStorage,
// 	});

// 	wallet = await selector.wallet('keypom')

// 	const accounts = await wallet.getAccounts()

// 	t.is(accounts[0].accountId, accountId)
// });

// test('transaction', async (t) => {

// 	const res = await wallet.signAndSendTransactions({
// 		transactions: [{
// 			receiverId: accountId,
// 			actions: [{
// 				type: 'Transfer',
// 				params: {
// 					deposit: parseNearAmount('0.42'),
// 				}
// 			}]
// 		}]
// 	})

// 	console.log(res)

// 	t.true(true)
// });