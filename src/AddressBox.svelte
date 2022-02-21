<script>
  import { isValidAddress, isValidAddressOrDomain } from "./query";

  export let placeholder = 'tz...';
  export let address = '';

  let valid = isValidAddressOrDomain(address);
  $: {
    valid = isValidAddressOrDomain(address);
  }
</script>

<input
  autocomplete="off" 
  spellcheck="false"
  type='text'
  {placeholder}
  data-lpignore="true"
  class:invalid={!valid}
  bind:value={address} />

<style>
  input {
    width: 25em;
    font-size: 14px;
    border: 1px solid green;
    border-radius: 3px;
    font-family: monospace;
    padding: 5px 5px;
    margin: 0;
  }
  input:focus {
    outline: none;
  }
  .invalid {
    border-color: gray;
  }
</style>