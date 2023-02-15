/* A helper file that simplifies using the wallet selector */

// near api js
import { providers } from 'near-api-js';

// wallet selector UI
import '@near-wallet-selector/modal-ui/styles.css';
import { setupModal } from '@near-wallet-selector/modal-ui';
import LedgerIconUrl from '@near-wallet-selector/ledger/assets/ledger-icon.png';
import MyNearIconUrl from '@near-wallet-selector/my-near-wallet/assets/my-near-wallet-icon.png';

// wallet selector options
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupLedger } from '@near-wallet-selector/ledger';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import {setupKeypom} from '../lib/index'

const THIRTY_TGAS = '30000000000000';
const NO_DEPOSIT = '0';

// Wallet that simplifies using the wallet selector
export class Wallet {
  walletSelector;
  wallet;
  network;
  createAccessKeyFor;

  constructor({ createAccessKeyFor = undefined, network = 'testnet' }) {
    // Login to a wallet passing a contractId will create a local
    // key, so the user skips signing non-payable transactions.
    // Omitting the accountId will result in the user being
    // asked to sign all transactions.
    this.createAccessKeyFor = createAccessKeyFor
    this.network = network
  }

  // To be called when the website loads
  async startUp() {
    this.walletSelector = await setupWalletSelector({
      network: this.network,
      modules: [
        setupMyNearWallet({ iconUrl: MyNearIconUrl }),
        //setupLedger({ iconUrl: LedgerIconUrl }),
        setupKeypom({ desiredUrl: '/keypom-url/'})
      ],
    });

    // const modal = setupKeypomModal({
    //   title: "this is my title",
    //   description: "this is my description",
    //   theme: "auto",
    // });
    
    // modal.show();
    
    //const wallet = await this.walletSelector.wallet('keypom');
    // if (url == asdasdasd) {//wallet.id == "keypom") {
    //   console.log("I'm keypom!!!")
    //   setupKeypom();
    // }


    //console.log('this.walletSelector: ', this.walletSelector)

    // const wallet = await this.walletSelector.wallet('keypom')
    // console.log('wallet: ', wallet)

    // const keypomSignedIn = await wallet.isSignedIn();
    // console.log('keypomSignedIn: ', keypomSignedIn)
    
    console.log('this.walletSelector: ', this.walletSelector)
    const isSignedIn = this.walletSelector.isSignedIn();
    console.log('isSignedIn: ', isSignedIn)

    if (isSignedIn) {
      this.wallet = await this.walletSelector.wallet();
      console.log('this.wallet: ', this.wallet)
      this.accountId = this.walletSelector.store.getState().accounts[0].accountId;
      console.log('this.accountId: ', this.accountId)
    }

    return isSignedIn;
  }

  // Sign-in method
  signIn() {
    const description = 'Please select a wallet to sign in.';
    const modal = setupModal(this.walletSelector, { contractId: this.createAccessKeyFor, description });
    modal.show();
  }

  // Sign-out method
  signOut() {
    this.wallet.signOut();
    this.wallet = this.accountId = this.createAccessKeyFor = null;
    window.location.replace(window.location.origin + window.location.pathname);
  }

  // Make a read-only call to retrieve information from the network
  async viewMethod({ contractId, method, args = {} }) {
    const { network } = this.walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    let res = await provider.query({
      request_type: 'call_function',
      account_id: contractId,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      finality: 'optimistic',
    });
    return JSON.parse(Buffer.from(res.result).toString());
  }

  // Call a method that changes the contract's state
  async callMethod({ contractId, method, args = {}, gas = THIRTY_TGAS, deposit = NO_DEPOSIT }) {
    const wallet = await this.wallet;
    console.log('wallet: ', wallet)

    // Sign a transaction with the "FunctionCall" action
    const outcome = await this.wallet.signAndSendTransaction({
      signerId: this.accountId,
      receiverId: contractId,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: method,
            args,
            gas,
            deposit,
          },
        },
      ],
    });
    
    console.log('outcome: ', outcome)
    return providers.getTransactionLastResult(outcome)
  }

  // Get transaction result from the network
  async getTransactionResult(txhash) {
    const { network } = this.walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    // Retrieve transaction result from the network
    const transaction = await provider.txStatus(txhash, 'unnused');
    return providers.getTransactionLastResult(transaction);
  }
}