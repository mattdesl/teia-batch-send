<script>
  export let tokens = [];

  let curPopup;
  let curImage;
  export let count = 0;
  export let selected = [];

  let allChecked = false;

  $: {
    if (allChecked) {
      tokens.forEach(t => {
        t.include = allChecked;
      })
    } else {
      tokens.forEach(t => {
        t.include = false;
      })
    }
    updateSelected();
  }

  function updateSelected () {
    selected = tokens.filter(t => t.include);
    count = selected.length;
    tokens = tokens;
  }

  function updateToken (ev, token) {
    token.include = ev.currentTarget.checked;
    selected = tokens.filter(t => t.include);
    count = selected.length;
  }
</script>

<div class='scroller'>
  <div class='token header'>
    <div class='check col'><input type='checkbox' bind:checked={allChecked} /></div>
    <div class='id col'>ID</div>
    <div class='title col'>Title</div>
    <div class='ipfs col'>IPFS</div>
  </div>

  {#each tokens as token, i}
  <div class='token' class:alt={i%2===0}>
      <div class='check col'><input type='checkbox' on:input={ev => updateToken(ev, token)} checked={token.include} /></div>
      <div class='id col'><a href="https://teia.art/objkt/{token.id}" target="_blank">{token.id}</a></div>
      <div class='title col'><span>{token.title}</span></div>
      <div class='ipfs col'><a href="{token.artifact_uri}" target="_blank">media</a></div>
  </div>
  {/each}
</div>

<style>
  .scroller {
    overflow-y: scroll;
    max-height: 400px;
    border: 1px solid gray;
    border-radius: 5px;
  }
  .popup {
    position: absolute;
    width: 75px;
    height: 75px;
    pointer-events: none;
    object-fit: contain;;
  }
  .popup img {
    object-fit: contain;;
    width: 100%;
    height: 100%;
  } 

  .header {
    background: black;
    color: white;
  }

  .token {
    display: flex;
    justify-content: flex-start;
    min-width: 0;
    align-items: center;
  }

  .col {
    /* border-right: 1px solid gray; */
    display: flex;
    justify-content: flex-start;
    align-items: center;
    /* display: inline-block; */
    min-width: 0;
    font-family: monospace;
    
    /* margin-right: 10px; */
    /* border: 1px solid blue; */
    width: 100px;
    height: 25px;
    font-size: 14px;
    padding-right: 10px;
    padding-left: 10px;
  }
  .alt {
    background: hsl(0,0%,93%);
  }
  .col span {
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .id {
    width: 75px;
  }
  .title {
    width: 175px;
  }
  .ipfs {
    width: 50px;
  }
  .check {
    width: 25px;
  }
</style>