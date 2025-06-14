<script lang="ts">
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 px-4"
>
	<div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
		<h1 class="mb-6 text-center text-3xl font-bold">👑 Vstúp do Bottom Gearu</h1>

		<!-- Prihlasovací formulár -->
		<form class="space-y-4" method="POST">
			<label class="block">
				<span class="text-sm font-medium text-gray-700">Tvoje prihlasovacie meno</span>
				<input
					type="text"
					placeholder="Prihlasovacie meno"
					class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
					required
					name="username"
				/>
			</label>

			<label class="block">
				<span class="text-sm font-medium text-gray-700">Meno roomky</span>
				<input
					type="text"
					placeholder="Meno roomky"
					class="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none"
					required
					name="room"
				/>
			</label>

			<button
				type="submit"
				class="w-full cursor-pointer rounded-lg bg-pink-500 px-4 py-2 font-semibold text-white hover:bg-pink-600"
			>
				Prihlásiť sa
			</button>
		</form>

		<!-- Oddelovač -->
		<div class="my-6 flex items-center justify-center gap-4 text-gray-400">
			<hr class="flex-grow border-t border-gray-300" />
			<span class="text-sm">alebo</span>
			<hr class="flex-grow border-t border-gray-300" />
		</div>

		<!-- Google OAuth (voliteľne) -->

		<a href="/login/google">
			<button
				class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 hover:bg-gray-50"
			>
				<img
					src="https://www.svgrepo.com/show/475656/google-color.svg"
					alt="Google"
					class="h-5 w-5"
					height="20"
					width="20"
				/>
				<span>Prihlásiť sa cez Google</span>
			</button>
		</a>

		<!-- Info text -->
		<p class="mt-6 text-center text-xs text-gray-500">
			Pokial nepoužijes google tento účet bude dostupný len na tomto zariadení.<br />
		</p>
	</div>
</div>
