<script lang="ts">
	import { user } from '$lib/userStore';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import type { Video } from '$lib/types';

	// Components
	import LandingHero from '$lib/components/LandingHero.svelte';
	import CreatorStudio from '$lib/components/CreatorStudio.svelte';
	import Feed from '$lib/components/Feed.svelte';

	let videos: Video[] = [];
	let loading = true;
	let errorMsg = '';

	// Interaction State
	let followedCreatorIds: Set<string> = new Set();
	let savedVideoIds: Set<string> = new Set();

	// Reactive Auth State
	$: isLoggedIn = !!$user;
	$: role = $user?.user_metadata?.role || 'learner';

	// Handle Logout: Clear Data
	$: if (!$user) {
		videos = [];
		loading = false;
	}

	// Handle Login: Fetch Data
	$: if ($user && videos.length === 0) {
		fetchContentWithUserData();
	}

	onMount(async () => {
		if (!isLoggedIn) {
			loading = false;
		} else {
			await fetchContentWithUserData();
		}
	});

	async function fetchContentWithUserData() {
		if (role !== 'creator') {
			await Promise.all([fetchFollows(), fetchSaved()]);
		}
		await fetchContent();
	}

	async function fetchFollows() {
		if (!$user) return;
		const { data } = await supabase
			.from('follows')
			.select('following_id')
			.eq('follower_id', $user.id);
		if (data) followedCreatorIds = new Set(data.map((f) => f.following_id));
	}

	async function fetchSaved() {
		if (!$user) return;
		const { data } = await supabase
			.from('playlist_videos')
			.select('video_id, playlists!inner(user_id)')
			.eq('playlists.user_id', $user.id);
		if (data) savedVideoIds = new Set(data.map((x) => x.video_id));
	}

	async function fetchContent() {
		if (!isLoggedIn) return;
		try {
			loading = true;
			if (role === 'creator') {
				const { data } = await supabase
					.from('videos')
					.select('*')
					.eq('creator_id', $user.id)
					.order('created_at', { ascending: false });
				videos = data || [];
			} else {
				// Fetch feed for learner
				const { data } = await supabase
					.from('videos')
					.select(
						'*, profiles!videos_creator_id_fkey(id, full_name, avatar_url, role), courses(id, title)'
					)
					.order('created_at', { ascending: false })
					.limit(50);

				let rawVideos = data || [];
				// Sort: Followed creators first
				// @ts-ignore
				videos = rawVideos.sort((a, b) => {
					const aFollows = followedCreatorIds.has(a.profiles?.id);
					const bFollows = followedCreatorIds.has(b.profiles?.id);
					if (aFollows && !bFollows) return -1;
					if (!aFollows && bFollows) return 1;
					return 0;
				});
			}
		} catch (err: any) {
			errorMsg = err.message;
		} finally {
			loading = false;
		}
	}

	// --- INTERACTIONS BUBBLED UP FROM FEED ---

	async function toggleFollow(e: CustomEvent) {
		const creatorId = e.detail;
		if (!$user || !creatorId) return;

		const isFollowing = followedCreatorIds.has(creatorId);
		const newSet = new Set(followedCreatorIds);
		if (isFollowing) newSet.delete(creatorId);
		else newSet.add(creatorId);
		followedCreatorIds = newSet;

		if (isFollowing) {
			await supabase
				.from('follows')
				.delete()
				.match({ follower_id: $user.id, following_id: creatorId });
		} else {
			await supabase.from('follows').insert({ follower_id: $user.id, following_id: creatorId });
		}
	}

	function handlePlaylistChange(e: CustomEvent) {
		const { videoId, isSaved } = e.detail;
		const newSet = new Set(savedVideoIds);
		if (isSaved) newSet.add(videoId);
		else newSet.delete(videoId);
		savedVideoIds = newSet;
	}
</script>

<div class="fixed inset-0 top-16 z-0 bg-black text-white overflow-hidden select-none">
	{#if !isLoggedIn}
		<LandingHero />
	{:else if loading}
		<div class="flex h-full flex-col items-center justify-center gap-6 animate-pulse">
			<div class="h-[70vh] w-full max-w-sm rounded-2xl bg-gray-900 border border-gray-800"></div>
		</div>
	{:else if errorMsg}
		<div class="flex h-full flex-col items-center justify-center text-center p-4">
			<div class="p-4 rounded-full bg-red-500/10 text-red-500 mb-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line
						x1="12"
						x2="12.01"
						y1="16"
						y2="16"
					/></svg
				>
			</div>
			<p class="text-gray-300 mb-4">{errorMsg}</p>
			<button
				class="px-6 py-2 rounded-full bg-white text-black font-medium hover:bg-gray-200"
				on:click={fetchContentWithUserData}>Retry</button
			>
		</div>
	{:else if role === 'creator'}
		<CreatorStudio {videos} />
	{:else}
		<Feed
			{videos}
			{followedCreatorIds}
			{savedVideoIds}
			on:follow={toggleFollow}
			on:playlistChange={handlePlaylistChange}
		/>
	{/if}
</div>
