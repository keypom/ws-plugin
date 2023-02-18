const test = require('ava')
const { readFileSync } = require('fs')
const keypomJS = require('keypom-js');
const { wrapParams } = require('../src/lib/utils/keypom-v2-utils');
const { initKeypom, getEnv, generateKeys, claim, createDrop, parseNearAmount } = keypomJS;
// custom linkdrop
const DROP_ROOT = 'linkdrop-beta.keypom.testnet'
// funder
const { account_id: accountId, public_key: publicKey, private_key: secretKey } = JSON.parse(readFileSync('./credentials.json'))

// const lsAccount = `near-api-js:keystore:${accountId}:testnet`

// MODULE VARS USED IN TESTS
let trialAccountId, trialPublicKey, trialSecretKey

const TRIAL_ACCOUNT_FUNDING_AMOUNT = parseNearAmount('2')

//@ts-ignore
test('initKeypom', async (t) => {

	await initKeypom({
		network: 'testnet',
		funder: {
			accountId,
			secretKey,
		},
		keypomContractId: "dev-1676742592813-14933979180879"
	})

	const { near } = getEnv();

	t.true(!!near);
	
});

//@ts-ignore
test('createDrop for trial account and claim to create trial account', async (t) => {

	const { publicKeys: newPublicKeys, secretKeys: newSecretKeys } = await generateKeys({ numKeys: 1 })
	trialPublicKey = newPublicKeys[0]
	trialSecretKey = newSecretKeys[0]
	const newAccountId = "bens-dope-ass-demo5.linkdrop-beta.keypom.testnet"

	console.log(`
	
	${JSON.stringify({
		account_id: newAccountId,
		public_key: trialPublicKey,
		private_key: trialSecretKey
	})}

	`)

	console.log(`http://localhost:1234/keypom-url/${newAccountId}#${trialSecretKey}`)

	//@ts-ignore
	const { keys: { secretKeys } } = await createDrop({
		numKeys: 1,
		config: {
			dropRoot: DROP_ROOT,
		},
		fcData: {
			methods: [[{
				receiverId: DROP_ROOT,
				methodName: 'create_account_advanced',
				//@ts-ignore
				attachedDeposit: TRIAL_ACCOUNT_FUNDING_AMOUNT,
				args: JSON.stringify({
					new_account_id: "INSERT_NEW_ACCOUNT",
					options: {
						contract_bytes: [...readFileSync('./out/main.wasm')],
						limited_access_keys: [{
							public_key: newPublicKeys[0],
							//@ts-ignore
							allowance: TRIAL_ACCOUNT_FUNDING_AMOUNT,
							receiver_id: "INSERT_NEW_ACCOUNT",
							method_names: 'execute',
						}],
					}
				}),
				userArgsRule: "UserPreferred"
			},
			{
				receiverId: "foobar",
				methodName: 'setup',
				//@ts-ignore
				attachedDeposit: parseNearAmount('0'),
				args: JSON.stringify(wrapParams({
					contracts: ["INSERT_NEW_ACCOUNT", 'dev-1676298343226-57701595703433'],
					amounts: ['1', '0.01'],
					methods: ['*', '*'],
					funder: accountId,
					repay: parseNearAmount('0.1'),
				})),
				userArgsRule: "UserPreferred",
				receiverToClaimer: true
			}
			]],
		}
	})

	let userFcArgs = {
		"INSERT_NEW_ACCOUNT": newAccountId
	}

	let userFcArgs2 = JSON.stringify(wrapParams({
		contracts: [newAccountId, 'dev-1676298343226-57701595703433'],
		amounts: ['1', '0.01'],
		methods: ['*', '*'],
		funder: accountId,
		repay: parseNearAmount('0.1'),
	}))

	const res = await claim({
		accountId: newAccountId,
		secretKey: secretKeys[0],
		fcArgs: [JSON.stringify(userFcArgs), userFcArgs2]
	})

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