<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/userStore';
	import { onMount } from 'svelte';
	import type { Playlist, Profile } from '$lib/types';
	import { goto } from '$app/navigation';

	let activeTab: 'playlists' | 'following' = 'playlists';
	let playlists: Playlist[] = [];
	let following: Profile[] = [];
	let loading = true;

	onMount(async () => {
		if (!$user) return goto('/login');
		await fetchData();
	});

	async function fetchData() {
		loading = true;

		// Fetch Playlists with video count
		const { data: plData } = await supabase
			.from('playlists')
			.select('*, playlist_videos(count)')
			.eq('user_id', $user?.id);

		// @ts-ignore
		playlists = plData?.map((p) => ({ ...p, video_count: p.playlist_videos[0].count })) || [];

		// Fetch Following
		const { data: fData } = await supabase
			.from('follows')
			.select('following_id, profiles!follows_following_id_fkey(*)')
			.eq('follower_id', $user?.id);

		// @ts-ignore
		following = fData?.map((f) => f.profiles) || [];

		loading = false;
	}
</script>

<div class="min-h-screen pt-24 px-6 pb-20 bg-black text-white">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-3xl font-bold mb-8">My Library</h1>

		<!-- Tabs -->
		<div class="flex gap-6 border-b border-white/10 mb-8">
			<button
				class="pb-3 text-sm font-bold uppercase tracking-wider transition border-b-2 {activeTab ===
				'playlists'
					? 'border-purple-500 text-white'
					: 'border-transparent text-gray-500 hover:text-gray-300'}"
				on:click={() => (activeTab = 'playlists')}
			>
				Playlists
			</button>
			<button
				class="pb-3 text-sm font-bold uppercase tracking-wider transition border-b-2 {activeTab ===
				'following'
					? 'border-purple-500 text-white'
					: 'border-transparent text-gray-500 hover:text-gray-300'}"
				on:click={() => (activeTab = 'following')}
			>
				Following
			</button>
		</div>

		{#if loading}
			<div class="animate-pulse space-y-4">
				<div class="h-20 bg-gray-900 rounded-xl"></div>
				<div class="h-20 bg-gray-900 rounded-xl"></div>
			</div>
		{:else if activeTab === 'playlists'}
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{#each playlists as pl}
					<!-- CHANGED: Now an anchor tag linking to the playlist ID -->
					<a
						href="/library/playlist/{pl.id}"
						class="group p-5 bg-gray-900 border border-white/5 rounded-xl hover:border-purple-500/30 transition cursor-pointer block"
					>
						<h3 class="font-bold text-lg text-white mb-1 group-hover:text-purple-400 transition">
							{pl.title}
						</h3>
						<p class="text-sm text-gray-500">
							{pl.video_count || 0} videos • {pl.is_public ? 'Public' : 'Private'}
						</p>
					</a>
				{/each}
				{#if playlists.length === 0}
					<p class="text-gray-500 col-span-full py-10 text-center">No playlists yet.</p>
				{/if}
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each following as creator}
					<div class="flex items-center gap-4 p-4 bg-gray-900 rounded-xl border border-white/5">
						<div
							class="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-lg"
						>
							{creator.full_name?.[0] || 'U'}
						</div>
						<div>
							<h4 class="font-bold text-white">{creator.full_name}</h4>
							<span class="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">Creator</span>
						</div>
					</div>
				{/each}
				{#if following.length === 0}
					<p class="text-gray-500 col-span-full py-10 text-center">
						You aren't following anyone yet.
					</p>
				{/if}
			</div>
		{/if}
	</div>
</div>
