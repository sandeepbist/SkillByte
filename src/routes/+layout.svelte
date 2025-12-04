<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/userStore';
	import { goto } from '$app/navigation';
	import '../app.css';

	onMount(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			user.set(session?.user ?? null);
		});

		// Listen for auth changes
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_event, session) => {
			user.set(session?.user ?? null);
			// Force redirect if session expires while on a protected route
			if (!session && window.location.pathname.includes('/creator')) {
				goto('/');
			}
		});

		return () => subscription.unsubscribe();
	});

	async function handleLogout() {
		await supabase.auth.signOut();
		user.set(null); // Immediate UI update
		goto('/', { invalidateAll: true }); // Force full state reset
	}

	$: role = $user?.user_metadata?.role;
</script>

<div
	class="min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white font-sans"
>
	<!-- FIXED NAVBAR -->
	<nav
		class="fixed top-0 z-50 w-full glass-heavy transition-all duration-300 border-b border-white/5"
	>
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
			<!-- LEFT: Navigation Links -->
			<div class="flex items-center gap-8">
				<a href="/" class="group flex items-center gap-2">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 text-white font-bold shadow-lg shadow-purple-500/20 transition group-hover:scale-105"
					>
						S
					</div>
					<span
						class="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-blue-400 transition-all"
					>
						SkillByte
					</span>
				</a>

				{#if $user && role === 'learner'}
					<div class="hidden md:flex items-center gap-6 border-l border-white/10 pl-6">
						<a
							href="/"
							class="text-sm font-medium transition hover:text-white {$user
								? 'text-gray-300'
								: 'text-white'}">Feed</a
						>
						<a
							href="/library"
							class="text-sm font-medium text-gray-300 hover:text-white transition flex items-center gap-2"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg
							>
							Library
						</a>
					</div>
				{/if}
			</div>

			<!-- RIGHT: Actions -->
			<div class="flex items-center gap-6">
				{#if $user}
					<!-- CREATOR TOOLBAR -->
					{#if role === 'creator'}
						<div
							class="hidden sm:flex items-center gap-1 bg-white/5 rounded-full p-1 pr-4 border border-white/10"
						>
							<a
								href="/"
								class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-gray-400 hover:bg-white/10 hover:text-white transition"
							>
								Studio
							</a>
							<a
								href="/creator/courses"
								class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-gray-400 hover:bg-white/10 hover:text-yellow-400 transition"
							>
								Courses
							</a>
							<a
								href="/creator/upload"
								class="ml-2 flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg hover:shadow-purple-500/25 transition hover:scale-105"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
									><line x1="12" x2="12" y1="5" y2="19" /><line
										x1="5"
										x2="19"
										y1="12"
										y2="12"
									/></svg
								>
								New Byte
							</a>
						</div>
					{/if}

					<!-- USER MENU -->
					<div class="flex items-center gap-4">
						<div class="hidden sm:flex flex-col items-end">
							<span class="text-xs font-bold text-white"
								>{$user.user_metadata?.full_name || 'User'}</span
							>
							<span class="text-[10px] uppercase tracking-wider text-gray-500 font-mono"
								>{role}</span
							>
						</div>

						<div class="h-8 w-1 bg-white/10 rounded-full mx-1"></div>

						<button
							on:click={handleLogout}
							class="text-xs font-bold text-gray-400 hover:text-red-400 transition uppercase tracking-wider"
						>
							Log Out
						</button>
					</div>
				{:else}
					<a
						href="/login"
						class="rounded-full bg-white px-6 py-2 text-sm font-bold text-black transition hover:bg-gray-200 hover:scale-105"
					>
						Log In
					</a>
				{/if}
			</div>
		</div>
	</nav>

	<main class="pt-16 h-screen overflow-hidden">
		<slot />
	</main>
</div>
