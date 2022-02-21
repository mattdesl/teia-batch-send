import { TezosToolkit } from "@taquito/taquito/dist/taquito.es6.js";
import { BeaconWallet } from "@taquito/beacon-wallet/dist/taquito-beacon-wallet.es6.js";
import { writable } from "svelte/store";
import { defaultEventCallbacks } from "@airgap/beacon-sdk";

const network = "mainnet";
const NODE_URL = `https://${network}.api.tez.ie`;

// Some contract addresses from https://batch.xtz.tools/
const contracts = [
  { address: "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton", name: "hic et nunc" },
  { address: "KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE", name: "fxhash" },
  { address: "KT1EpGgjQs73QfFJs9z7m1Mxm5MTnpC2tqse", name: "Kalamint" },
  {
    address: "KT1PKvHNWuWDNVDtqjDha4AostLrGDu4G1jy",
    name: "Bazaar Tokens (BATOs)",
  },
  { address: "KT1VbHpQmtkA3D4uEbbju26zS8C42M5AGNjZ", name: "PRJKTNEON" },
  { address: "KT1H8sxNSgnkCeZsij4z76pkXu8BCZNvPZEx", name: "PRJKTNEON FILES" },
  { address: "KT1LHHLso8zQWQWg1HUukajdxxbkGfNoHjh6", name: "Tezzardz" },
];

const Tezos = new TezosToolkit(NODE_URL);

const walletSymbol = Symbol.for("active-wallet");
let currentAbortMechanism;

export const state = writable(undefined);

export function getWallet() {
  if (window[walletSymbol]) {
    return window[walletSymbol];
  }
  console.log("Creating client");
  const wallet = new BeaconWallet({
    preferredNetwork: network,
    name: "send.nfts",
    eventHandlers: {
      PAIR_INIT: {
        handler: (data) => {
          return defaultEventCallbacks.PAIR_INIT({
            ...data,
            abortedHandler: () => {
              data.abortedHandler();
              return abortedHandler();
            },
          });
        },
      },
    },
  });
  window[walletSymbol] = wallet;
  Tezos.setWalletProvider(wallet);
  return wallet;
}

export const ready = (async () => {
  const wallet = getWallet();
  const account = await wallet.client.getActiveAccount();
  state.update((d) => account);
})();

export async function disconnect() {
  const wallet = getWallet();
  if (wallet) {
    await wallet.client.clearActiveAccount();
    await wallet.disconnect();
  }
  window[walletSymbol] = null;
  state.update((d) => undefined);
}

function abortedHandler() {
  if (currentAbortMechanism) {
    currentAbortMechanism();
    currentAbortMechanism = null;
  }
}

function requestPermissions() {
  const noop = () => {};
  let promise = new Promise((resolve, reject) => {
    const clear = () => {
      reject = noop;
      resolve = noop;
      currentAbortMechanism = null;
    };
    currentAbortMechanism = () => {
      reject(new Error(`[ABORTED_ERROR]:The action was aborted by the user.`));
    };
    getWallet()
      .requestPermissions()
      .then(() => {
        Tezos.setWalletProvider(getWallet());
        resolve();
        clear();
      })
      .catch((err) => {
        reject(err);
        clear();
      });
  });
  return promise;
}

export async function connect() {
  const wallet = getWallet();
  let account = await wallet.client.getActiveAccount();
  if (!account) {
    console.log("Requesting Permissions");
    try {
      await requestPermissions();
    } catch (err) {
      if (err.message && !err.message.includes("ABORTED_ERROR"))
        console.error(err.message);
    }
    account = await wallet.client.getActiveAccount();
  }

  if (account) {
    const pkh = account.address;
    console.log("pkh", pkh);
  } else {
    console.log("rejected");
  }
  state.update((d) => account);
}

export async function transfer(tokens, targetAddress, opt = {}) {
  const { event = () => {} } = opt;
  const wallet = getWallet();
  const account = await wallet.client.getActiveAccount();
  if (!account) throw new Error("no account connected");
  const walletAddress = account.address;
  const contractAddress = "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton";
  console.log("Getting contract...", contractAddress);

  const contract = await Tezos.wallet.at(contractAddress);
  console.log("Contract:", contract);

  const txs = tokens.map((token) => {
    return {
      to_: targetAddress,
      token_id: token.id,
      amount: 1,
    };
  });

  // Prepare smart contract parameters
  const params = [
    {
      from_: walletAddress,
      txs,
    },
  ];

  const txConfirmations = 1;
  const txConfirmationTimeout = txConfirmations * (2 * 60);

  const operation = await contract.methods
    .transfer(params)
    .send({ amount: 0, mutez: true });

  event({ event: "confirming", hash: operation.opHash });
  console.log(operation);
  console.log(operation.opHash);
  
  await operation.confirmation(1);
  event({ event: "done", hash: operation.opHash });
}
