<script lang="ts">
    import MicrotransactionDialog from '$lib/components/MicrotransactionDialog.svelte';
    import AdminRequestDialog from '$lib/components/AdminRequestDialog.svelte';
    import type { User } from '$lib/types';

    export let user: User;
    export let moneyRequests: any[] = [];

    let microtransactionDialog: MicrotransactionDialog;
    let adminRequestDialog: AdminRequestDialog;
</script>

<header class="navbar bg-base-100">
    <div class="flex-1">
        <a href="/" class="btn btn-ghost normal-case text-xl">Bottom Gear</a>
    </div>
    <div class="flex-none">
        <ul class="menu menu-horizontal px-1">
            {#if user.isAdmin}
                <li>
                    <button class="indicator" onclick={() => adminRequestDialog.show()}>
                        {#if moneyRequests && moneyRequests.length > 0}
                            <span class="indicator-item badge badge-secondary"></span>
                        {/if}
                        Admin
                    </button>
                </li>
            {/if}
            <li>
                <button onclick={() => microtransactionDialog.show()}>Request coins</button>
            </li>
            <li>
                <span>{user.money} coins</span>
            </li>
        </ul>
    </div>
</header>

<MicrotransactionDialog bind:this={microtransactionDialog} />
{#if user.isAdmin}
    <AdminRequestDialog bind:this={adminRequestDialog} bind:requests={moneyRequests} />
{/if}
