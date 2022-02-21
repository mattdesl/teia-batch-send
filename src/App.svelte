<script>
  import AddressBox from './AddressBox.svelte';
  import { getAddress, getCollection, isValidAddress, isValidAddressOrDomain } from './query';
  import WalletButton from './WalletButton.svelte';
  import TokenList from './TokenList.svelte';
  import { transfer } from './tz-wallet';

  let account;
  let targetAddress = '';
  
  let count = 0;
  let sending = false;
  let selected = [];
  let currentDataFetch = Promise.resolve([]);
  let currentEvent = null;

  $: updateData(account && account.address);

  function updateData (resolvedAddress) {
    if (resolvedAddress) {
      currentDataFetch = getCollection(resolvedAddress).then(tokens => {
        return tokens.map(({ token }) => token);
      }).catch(err => {
        console.error(err);
        return [];
      });
    } else {
      currentDataFetch = Promise.resolve([]);
    }
  }

  async function send () {
    currentEvent = null;
    if (!account) {
      alert('No connected account');
      return;
    }
    if (selected.length <= 0) {
      alert('No tokens selected to send');
      return;
    }
    if (!isValidAddressOrDomain(targetAddress)) {
      alert('Target address is invalid');
      return;
    }
    let resolvedAddress;
    try {
      resolvedAddress = await getAddress(targetAddress);
    } catch (err) {
      console.error(err);
      alert('Could not resolve tezos domain');
      return;
    }
    if (!isValidAddressOrDomain(resolvedAddress)) {
      alert('Resolved address is invalid');
      return;
    }
    if (resolvedAddress === account.address) {
      alert('Target address is equal to connected address')
      return;
    }
    try {
      await transfer(selected, resolvedAddress, {
        event: (d) => {
          currentEvent = { ...d };
        }
      });
      updateData(account && account.address);
      if (currentEvent && !currentEvent.hash) {
        currentEvent = null;
      }
    } catch (err) {
      if (err.message.startsWith("[ABORTED_ERROR]")) return;
      console.error(err);
      alert(err.message);
      return;
    }
  }

  
</script>

<main>
  <div class='top'>
    <header><a href="https://github.com/mattdesl/teia-batch-send" target="_blank">teia-batch-send.utils.tez</a></header>
    <WalletButton bind:account={account} />
  </div>

  <section class='info'>
    <p>This tool can transfer a batch of <a href="http://teia.art/" target="_blank">Teia</a> tokens in a single transaction.</p>
    <p><em class='warning'>⚠️ This is beta software for proof-of-concept only. Use at your own risk!</em></p>
  </section>

  <section class='app'>
    {#if account}
      <!-- <div>
        <span class='input-label'>Contract Address:</span> 
        <AddressBox bind:address={contractAddress} placeholder="KT1..." />
      </div> -->

      {#await currentDataFetch}
        
      {:then tokens}
        {#if tokens && tokens.length}
          <TokenList {tokens} bind:count={count} bind:selected={selected} />
          <div class='target'>
            {#if count > 0}
            <div class='target-row'>
              <div class='input-label'>Send to Address:</div> 
              <AddressBox bind:address={targetAddress} />
            </div>
            <div class='target-row'>
              <div class='input-label'></div> 
              <button disabled={sending} class:sending={sending} on:click={() => {
                if (sending) return;
                sending = true;
                send().then(() => {
                  sending = false;
                }, () => {
                  sending = false;
                })
              }} class='send'>
              {#if sending}
                Sending...
              {:else}
                Send {count} {count!==1?'tokens':'token'}
              {/if}</button>
              {#if currentEvent}
                <div class='progress'>
                  {#if currentEvent.hash}
                    <a href="https://tzkt.io/{currentEvent.hash}" target="_blank">↗ view operation</a>
                  {:else}
                    {currentEvent.event}
                  {/if}
                </div>
              {/if}
            </div>
            {:else}
            <div class='target-row no-tokens'>
              No tokens selected
            </div>
            {/if}
          </div>
        {:else}
        <div class='first-connect'>No Teia tokens found under the account <strong>{account.address}</strong>.</div>
        {/if}
      <!-- {:else} -->
      <!-- {/if} -->
      {/await}

      
    {:else}
      <div class='first-connect'>You must first connect your wallet to use this dApp.</div>
    {/if}
  </section>
</main>

<style>

  :global(body) {
    padding: 20px;
    margin: 0;
    background: #e8d4cf;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
  :global(html) {
    width: 100%;
  }

  :global(a), :global(a:active), :global(a.visited) {
    color: #260ced;
  }

  .input-label {
    margin-right: 5px;
    min-width: 120px;
    min-height: 0;
    /* font-weight: 500; */
  }

  .progress {
    font-size: 12px;
    margin-left: 10px;
  }

  .target-row {
    display: flex;
    justify-content: flex-start;
    align-items: baseline;
    flex-direction: row;
    margin-top: 20px;
  }
  .warning {
    /* color: #ba5d00; */
    font-weight: bold;
  }
  .send {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 14px;
    padding: 10px 15px;
    margin: 0;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 50px;
    background: black;
    border: 0;
    color: white;
  }
  .sending {
    background: initial;
    border: 1px solid hsl(0,0%,50%);
    color: hsl(0,0%,50%);
    cursor: initial;
  }
  .target {
    margin-top: 20px;
  }
  .count {
    font-size: 12px;
    margin: 10px;
  }

  main {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
    font-size: 14px;
    width: 100%;
  }
  header {
    font-size: 18px;
    font-weight: 300;
    text-transform: lowercase;
  }
  header a {
    color: black;
  }
  .no-tokens {
    font-style: italic;
    font-size: 12px;
  }
  .first-connect {
    /* border: 1px solid hsl(0,0%,25%); */
    font-style: italic;
    /* padding: 20px; */
    border-left: 5px solid hsl(0,0%,5%);
    padding: 5px 10px;
    /* background: hsla(0,0%,95%, 0.25); */
  }
  .top {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .info {

  }
</style>

<!-- 
<button on:click={disconnect}>Disconnect</button> -->