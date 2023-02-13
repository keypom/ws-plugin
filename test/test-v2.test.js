const test = require('ava')
const { readFileSync } = require('fs')
const keypomJS = require('keypom-js')
const { initKeypom, getEnv, nearAPI } = keypomJS;
const { Account, KeyPair } = nearAPI
const keypomUtils = require('../src/lib/keypom-v2-utils')
const { wrapParams } = keypomUtils;
const wsCore = require("@near-wallet-selector/core");
const { setupWalletSelector } = wsCore

// v2 lib
const keypomV2 = require('../lib/index')
const { setupKeypom } = keypomV2

// custom linkdrop
const DROP_ROOT = 'linkdrop-beta.keypom.testnet'
//@ts-ignore v2 account creds
const { account_id: accountId, public_key: publicKey, private_key: secretKey } = JSON.parse(readFileSync('./cred-v2.json'))

/// mocking for tests with wallet-selector
const _ls = {}
window = {
	//@ts-ignore
	location: {
		href: `https://example.com/#/keypom/${accountId}/${secretKey}`
	},
	//@ts-ignore
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


// MODULE Vars for tests
let selector, wallet

//@ts-ignore
test('init wallet-selector and test v2 tx', async (t) => {

	
	selector = await setupWalletSelector({
		network: 'testnet',
		// contractId,
		debug: 'true',
		modules: [
			setupKeypom()
		],
		// storage: window.localStorage,
	});

	wallet = await selector.wallet('keypom')
	console.log('wallet: ', wallet)

	const accounts = await wallet.getAccounts()
	console.log('accounts: ', accounts)

	t.is(accounts[0].accountId, accountId)

	const res = await wallet.signAndSendTransactions({
		transactions: [{
			receiverId: 'guest-book.testnet',
			actions: [{
				type: 'FunctionCall',
				params: {
					methodName: 'addMessage',
					args: { text: 'WHATTUP MOTHA FUCKAAAAAZ!' },
					gas: '30000000000000',
					deposit: '0'
				}
			}]
		}]
	})

	console.log(res)

	t.true(true)
});
