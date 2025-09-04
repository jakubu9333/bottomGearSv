<script lang="ts">
    import Header from '$lib/components/Header.svelte';
    import type { LayoutData } from './$types';
    import { onMount } from 'svelte';
    import type { MoneyRequestEvent, MoneyUpdateEvent } from '$lib/types';

    let { data }: { data: LayoutData } = $props();
    let moneyRequests = $state(data.moneyRequests || []);
    let user = $state(data.user);

    onMount(() => {
        const socketUrl = 'ws://localhost:8787';
        const socket = new WebSocket(`${socketUrl}/room/${data.user.roomId}/ws`);

        socket.addEventListener('message', async (ev: MessageEvent<string>) => {
            const socketData: MoneyRequestEvent | MoneyUpdateEvent = JSON.parse(ev.data);
            if (socketData.type === 'money_request') {
                moneyRequests.push({
                    id: socketData.id,
                    amount: socketData.amount,
                    price: socketData.price,
                    status: 'pending',
                    user: {
                        id: 0, // We don't have the user id here
                        name: socketData.user,
                    },
                });
            } else if (socketData.type === 'money_update') {
                if (socketData.userId === user.id) {
                    const response = await fetch('/me');
                    if (response.ok) {
                        user = await response.json();
                    }
                }
            }
        });
    });
</script>

<Header bind:user={user} bind:moneyRequests={moneyRequests} />
<slot />
