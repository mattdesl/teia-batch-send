# teia-batch-send

A dApp to batch send multiple [Teia](http://teia.art/) tokens in one transaction.

> :warning: This is untested software. Use the dApp at your own risk.

## Concept

This is a rough proof-of-concept of a decentralized app (dApp) for use in a blockchain context, in this case Tezos. 

## IPFS

The website is entirely contained in a single HTML file, accessible via the following [IPFS](https://ipfs.io/) hash.

```sh
ipfs://QmdtwM1u3ELnGY3p5F4uBf1dgPQGUvYNffYHaeasbhdFec
```

The domain [teia-batch-send.utils.tez](https://app.tezos.domains/domain/teia-batch-send.utils.tez) has a Content URL that will point to this hash.

### Online Mirror

You can also access the site at the following link:

https://teia-batch-send.netlify.app/

## Install Locally

Tested with `node@17.1.0` and `npm@8.1.2`.

```sh
cd teia-batch-send
npm install
npm run dev
```

## Credits

This dApp was created by [@mattdesl](https://twitter.com/mattdesl), using [PureSpider's FA2 Token Batch tool](https://batch.xtz.tools/) as a reference.

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/fa2-batch-send/blob/master/LICENSE.md) for details.
