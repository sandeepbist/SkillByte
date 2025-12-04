<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import type { UserRole } from '$lib/types';
	import { fade, slide } from 'svelte/transition';

	let loading = false;
	let isRegistering = false;
	let errorMessage = '';

	// Form
	let email = '';
	let password = '';
	let fullName = '';
	let role: UserRole = 'learner';

	const handleAuth = async () => {
		loading = true;
		errorMessage = '';

		try {
			if (isRegistering) {
				// Sign Up
				const { error } = await supabase.auth.signUp({
					email,
					password,
					options: {
						data: { full_name: fullName, role: role }
					}
				});
				if (error) throw error;
				alert('Success! Please check your email to verify.');
				isRegistering = false;
			} else {
				// Log In
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password
				});
				if (error) throw error;
				goto('/');
			}
		} catch (err: any) {
			errorMessage = err.message || 'An error occurred';
		} finally {
			loading = false;
		}
	};
</script>

<!-- Container accounts for fixed navbar (pt-16) -->
<div class="flex min-h-[calc(100vh-64px)] w-full items-center justify-center p-4">
	<div
		class="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-xl shadow-2xl transition-all duration-300"
	>
		<!-- Header -->
		<div class="bg-white/5 p-8 text-center border-b border-white/5">
			<h1 class="text-2xl font-bold text-white tracking-tight">
				{isRegistering ? 'Join the Community' : 'Welcome Back'}
			</h1>
			<p class="mt-2 text-sm text-gray-400">
				{isRegistering ? 'Start your micro-learning journey.' : 'Continue where you left off.'}
			</p>
		</div>

		<div class="p-8">
			{#if errorMessage}
				<div
					class="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center"
					transition:fade
				>
					{errorMessage}
				</div>
			{/if}

			<form on:submit|preventDefault={handleAuth} class="space-y-5">
				{#if isRegistering}
					<div transition:slide>
						<label
							for="name"
							class="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400"
							>Full Name</label
						>
						<input
							type="text"
							id="name"
							bind:value={fullName}
							required
							class="w-full rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:bg-gray-800 focus:ring-1 focus:ring-purple-500 outline-none transition"
							placeholder="Jane Doe"
						/>
					</div>

					<div transition:slide>
						<label
							for="role"
							class="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400"
							>I am a...</label
						>
						<div class="grid grid-cols-2 gap-3">
							<button
								type="button"
								class="rounded-lg border p-3 text-sm font-medium transition-all duration-200 {role ===
								'learner'
									? 'border-purple-500 bg-purple-500/20 text-white'
									: 'border-gray-700 bg-gray-800/30 text-gray-400 hover:bg-gray-800'}"
								on:click={() => (role = 'learner')}
							>
								Learner
							</button>
							<button
								type="button"
								class="rounded-lg border p-3 text-sm font-medium transition-all duration-200 {role ===
								'creator'
									? 'border-blue-500 bg-blue-500/20 text-white'
									: 'border-gray-700 bg-gray-800/30 text-gray-400 hover:bg-gray-800'}"
								on:click={() => (role = 'creator')}
							>
								Creator
							</button>
						</div>
					</div>
				{/if}

				<div>
					<label
						for="email"
						class="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400"
						>Email</label
					>
					<input
						type="email"
						id="email"
						bind:value={email}
						required
						class="w-full rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:bg-gray-800 focus:ring-1 focus:ring-purple-500 outline-none transition"
						placeholder="you@example.com"
					/>
				</div>

				<div>
					<label
						for="password"
						class="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400"
						>Password</label
					>
					<input
						type="password"
						id="password"
						bind:value={password}
						required
						class="w-full rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:bg-gray-800 focus:ring-1 focus:ring-purple-500 outline-none transition"
						placeholder="••••••••"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-lg bg-white py-3.5 text-sm font-bold text-black shadow-lg shadow-white/10 transition hover:bg-gray-200 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
				>
					{loading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
				</button>
			</form>

			<div class="mt-6 text-center">
				<button
					on:click={() => (isRegistering = !isRegistering)}
					class="text-sm text-gray-400 hover:text-white hover:underline transition"
				>
					{isRegistering ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
				</button>
			</div>
		</div>
	</div>
</div>
