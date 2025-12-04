<script lang="ts">
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import type { Video } from '$lib/types';

	let playlistId = $page.params.id;
	let title = '';
	let videos: Video[] = [];
	let loading = true;

	onMount(async () => {
		await fetchData();
	});

	async function fetchData() {
		// 1. Get Playlist Info
		const { data: pl } = await supabase
			.from('playlists')
			.select('title')
			.eq('id', playlistId)
			.single();

		if (pl) title = pl.title;

		// 2. Get Videos in Playlist
		// FIX: We added '!videos_creator_id_fkey' to the profiles query below.
		// This tells Supabase: "Fetch the profile who CREATED this video, not the person who saved it."
		const { data: pv, error } = await supabase
			.from('playlist_videos')
			.select('video_id, videos!inner(*, profiles!videos_creator_id_fkey(full_name))')
			.eq('playlist_id', playlistId)
			.order('added_at', { ascending: false });

		if (error) {
			console.error('Error fetching playlist items:', error);
		}

		// Flatten the structure from { videos: {...} } to just {...}
		// @ts-ignore
		videos = pv?.map((item) => item.videos) || [];
		loading = false;
	}
</script>

<div class="min-h-screen pt-24 px-4 pb-20 bg-black text-white">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="mb-8 border-b border-white/10 pb-6">
			<a href="/library" class="text-sm text-gray-400 hover:text-white mb-4 inline-block transition"
				>&larr; Back to Library</a
			>
			<h1
				class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent"
			>
				{loading ? 'Loading...' : title}
			</h1>
			<p class="text-gray-400 mt-2">{videos.length} Saved Reels</p>
		</div>

		{#if loading}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
				<div class="aspect-[9/16] bg-gray-900 rounded-xl"></div>
				<div class="aspect-[9/16] bg-gray-900 rounded-xl"></div>
				<div class="aspect-[9/16] bg-gray-900 rounded-xl"></div>
			</div>
		{:else if videos.length === 0}
			<div class="text-center py-20 text-gray-500 border border-dashed border-gray-800 rounded-2xl">
				<p class="mb-2">This playlist is empty.</p>
				<a href="/" class="text-purple-400 hover:text-purple-300 font-medium underline transition"
					>Go watch some reels</a
				>
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{#each videos as video}
					<div
						class="group relative aspect-[9/16] rounded-xl bg-gray-900 border border-white/10 overflow-hidden shadow-lg transition hover:shadow-purple-500/20 hover:border-white/20"
					>
						<!-- Simple Player -->
						<video
							src={video.video_url}
							class="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition duration-300"
							controls
							preload="metadata"
						></video>

						<!-- Overlay Info -->
						<div
							class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none"
						>
							<h3 class="font-bold text-white text-sm truncate">{video.title}</h3>
							<p class="text-xs text-gray-300 mt-0.5">
								{video.profiles?.full_name || 'Unknown Creator'}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
