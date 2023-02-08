const test = require('ava')
const { readFileSync } = require('fs')
const keypomJS = require('keypom-js')
const { initKeypom, getEnv, generateKeys, claim, createDrop, parseNearAmount } = keypomJS;
const keypomUtils = require('../src/lib/keypom-v2-utils')
const { wrapParams } = keypomUtils;
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
		}
	})

	const { near } = getEnv();

	t.true(!!near);
	
});

//@ts-ignore
test('createDrop for trial account and claim to create trial account', async (t) => {

	const { publicKeys: newPublicKeys, secretKeys: newSecretKeys } = await generateKeys({ numKeys: 1 })
	trialPublicKey = newPublicKeys[0]
	trialSecretKey = newSecretKeys[0]
	trialAccountId = `test-${Date.now()}.${DROP_ROOT}`

	console.log(`
	
	${JSON.stringify({
		account_id: trialAccountId,
		public_key: trialPublicKey,
		private_key: trialSecretKey
	})}

	`)

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
					new_account_id: trialAccountId,
					options: {
						contract_bytes: [...readFileSync('./out/main.wasm')],
						limited_access_keys: [{
							public_key: newPublicKeys[0],
							//@ts-ignore
							allowance: TRIAL_ACCOUNT_FUNDING_AMOUNT,
							receiver_id: trialAccountId,
							method_names: 'execute',
						}],
					}
				}),
			},
			{
				receiverId: trialAccountId,
				methodName: 'setup',
				//@ts-ignore
				attachedDeposit: parseNearAmount('0'),
				args: JSON.stringify(wrapParams({
					contracts: [trialAccountId, 'guest-book.testnet'],
					amounts: ['1', '0.01'],
					methods: ['*', '*'],
					funder: accountId,
					repay: parseNearAmount('0.1'),
				})),
			}
			]],
		}
	})

	const res = await claim({
		accountId: 'blah',
		secretKey: secretKeys[0],
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