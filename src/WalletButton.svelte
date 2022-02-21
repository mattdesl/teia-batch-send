<script>
  import { ready, state, connect, disconnect } from './tz-wallet.js'
  import { shortAddress } from './tz-util.js';
  import { onMount, createEventDispatcher } from 'svelte';

  export let account = undefined;

  const dispatch = createEventDispatcher();
  const unsub = state.subscribe(d => { 
    account = d; });

  onMount(() => {
    return () => {
      unsub();
    }
  })

  
</script>

<button class='button connect' on:click={async (ev) => {
  if (account) {
    await disconnect();
    dispatch('disconnect');
    dispatch('change');
  } else {
    await connect();
    dispatch('connect');
    dispatch('change');
  }
}}>
  {#if account}
    <div class='bullet active'></div>
    <div class='connected-state'>{shortAddress(account.address)}</div>
  {:else}
    <div class='bullet'></div>
    <div class='connected-state'>Connect Wallet</div>
  {/if}
</button>

<style>
  .bullet {
    width: 8px;
    height: 8px;
    border-radius: 100%;
    background: #ed0505;
    content: ' ';
    margin-right: 10px;
  }
  .bullet.active {
    background: #5eb330;
  }
  .button {
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
</style>