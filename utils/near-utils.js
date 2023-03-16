const fs = require("fs");
const nearAPI = require("near-api-js");
const getConfig = require("./config");
const { nodeUrl, walletUrl, networkId, contractId, isBrowser } = getConfig();

const {
	keyStores: { InMemoryKeyStore, BrowserLocalStorageKeyStore },
	Near,
	Account,
	Contract,
	KeyPair,
	utils: {
		format: { parseNearAmount },
	},
} = nearAPI;

const keyStore = new InMemoryKeyStore();

const near = new Near({
	networkId,
	nodeUrl,
	walletUrl,
	keyStore,
});
const { connection } = near;
const contractAccount = new Account(connection, contractId);

module.exports = {
	near,
	networkId,
	accountSuffix: networkId === 'mainnet' ? '.near' : '.' + networkId,
	connection,
	keyStore,
	contractId,
	contractAccount,
};
