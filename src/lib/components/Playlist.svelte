<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/userStore';
	import { createEventDispatcher } from 'svelte';
	import { fly, fade, slide } from 'svelte/transition';
	import type { Playlist } from '$lib/types';

	export let isOpen = false;
	export let videoId: string;

	let playlists: Playlist[] = [];
	let selectedPlaylistIds: Set<string> = new Set();
	let newPlaylistName = '';
	let creating = false;
	let loading = true;

	const dispatch = createEventDispatcher();

	$: if (isOpen && $user) loadPlaylists();

	async function loadPlaylists() {
		loading = true;

		// 1. Get User's Playlists
		const { data: plData } = await supabase
			.from('playlists')
			.select('id, title, is_public')
			.eq('user_id', $user?.id)
			.order('created_at', { ascending: false });

		playlists = plData || [];

		// 2. Check which playlists already contain this video
		const { data: pvData } = await supabase
			.from('playlist_videos')
			.select('playlist_id')
			.eq('video_id', videoId);

		selectedPlaylistIds = new Set(pvData?.map((x) => x.playlist_id) || []);
		loading = false;
	}

	async function togglePlaylist(playlistId: string) {
		const isSelected = selectedPlaylistIds.has(playlistId);

		// Optimistic UI
		if (isSelected) selectedPlaylistIds.delete(playlistId);
		else selectedPlaylistIds.add(playlistId);
		selectedPlaylistIds = selectedPlaylistIds;

		if (isSelected) {
			await supabase
				.from('playlist_videos')
				.delete()
				.match({ playlist_id: playlistId, video_id: videoId });
		} else {
			await supabase.from('playlist_videos').insert({ playlist_id: playlistId, video_id: videoId });
		}

		// Notify Parent to update Icon
		dispatch('change', {
			videoId,
			isSaved: selectedPlaylistIds.size > 0
		});
	}

	async function createPlaylist() {
		if (!newPlaylistName.trim()) return;
		creating = true;

		const { data } = await supabase
			.from('playlists')
			.insert({ user_id: $user?.id, title: newPlaylistName, is_public: false })
			.select()
			.single();

		if (data) {
			playlists = [data, ...playlists];
			await togglePlaylist(data.id);
			newPlaylistName = '';
		}
		creating = false;
	}

	function close() {
		dispatch('close');
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
		transition:fade
		on:click={close}
	></div>

	<div
		class="fixed bottom-0 left-0 right-0 z-[70] h-auto max-h-[70vh] rounded-t-3xl bg-[#111] border-t border-white/10 shadow-2xl flex flex-col md:max-w-md md:mx-auto md:bottom-10 md:rounded-3xl"
		transition:fly={{ y: 300, duration: 300 }}
	>
		<div class="flex justify-center pt-3 pb-1" on:click={close}>
			<div class="h-1.5 w-12 rounded-full bg-gray-700"></div>
		</div>

		<div class="px-6 py-4 border-b border-white/10">
			<h3 class="text-lg font-bold text-white">Save to Playlist</h3>
		</div>

		<div class="flex-1 overflow-y-auto p-6 space-y-2">
			{#if loading}
				<div class="space-y-3 animate-pulse">
					<div class="h-12 bg-gray-800 rounded-xl"></div>
					<div class="h-12 bg-gray-800 rounded-xl"></div>
				</div>
			{:else}
				<div class="flex gap-2 mb-4">
					<input
						type="text"
						bind:value={newPlaylistName}
						placeholder="New playlist name..."
						class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition"
					/>
					<button
						on:click={createPlaylist}
						disabled={!newPlaylistName || creating}
						class="bg-purple-600 px-4 py-2 rounded-lg font-bold text-white disabled:opacity-50 hover:bg-purple-500 transition"
					>
						+
					</button>
				</div>

				{#each playlists as playlist (playlist.id)}
					<button
						class="w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 {selectedPlaylistIds.has(
							playlist.id
						)
							? 'bg-purple-500/20 border-purple-500/50'
							: 'bg-gray-900 border-gray-800 hover:bg-gray-800'}"
						on:click={() => togglePlaylist(playlist.id)}
					>
						<div class="flex items-center gap-3">
							<div class="bg-gray-800 p-2 rounded-lg">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="text-purple-400"
									><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle
										cx="18"
										cy="16"
										r="3"
									/></svg
								>
							</div>
							<span class="font-medium text-white">{playlist.title}</span>
						</div>

						{#if selectedPlaylistIds.has(playlist.id)}
							<div
								class="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center"
								transition:slide
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="white"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg
								>
							</div>
						{/if}
					</button>
				{/each}
			{/if}
		</div>
	</div>
{/if}
