const test = require('ava')
const { readFileSync } = require('fs')

import { setupKeypom, parseNearAmount } from 'keypom-js';

const wsCore = require("@near-wallet-selector/core");
const { setupWalletSelector } = wsCore

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

test('init some keypom-trial account', async (t) => {

	await initKeypom({
		network: 'testnet',
		funder: {
			accountId,
			secretKey,
		}
	})

	
	
});

test('init', async (t) => {

	selector = await setupWalletSelector({
		network: networkId,
		contractId,
		debug: 'true',
		modules: [
			setupKeypom()
		],
		// storage: window.localStorage,
	});

	wallet = await selector.wallet('keypom')

	const accounts = await wallet.getAccounts()

	t.is(accounts[0].accountId, accountId)
});

test('transaction', async (t) => {

	const res = await wallet.signAndSendTransactions({
		transactions: [{
			receiverId: accountId,
			actions: [{
				type: 'Transfer',
				params: {
					deposit: parseNearAmount('0.42'),
				}
			}]
		}]
	})

	console.log(res)

	t.true(true)
});