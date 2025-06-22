<script lang="ts">
  type Props = {
    moneyToBet: number;
    money: number;
  };
  let { moneyToBet = $bindable(), money }: Props = $props();
</script>

<div class="flex-col flex">
  <label for="#bet" class="font-bold text-xl">Selected money</label>
  <input
    bind:value={moneyToBet}
    type="number"
    id="bet"
    max={money}
    min="0"
    class="input input-bordered input-primary"
  />
  <input
    type="range"
    class="mt-2 range range-primary"
    bind:value={moneyToBet}
    min="0"
    max={money}
  />
</div>
