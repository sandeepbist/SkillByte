<script lang="ts">
	import type { Video } from '$lib/types';
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { gsap } from 'gsap';
	import VideoReel from './VideoReel.svelte';
	import Comments from '$lib/components/Comments.svelte';
	import AddToPlaylist from '$lib/components/Playlist.svelte';

	export let videos: Video[] = [];
	export let followedCreatorIds: Set<string> = new Set();
	export let savedVideoIds: Set<string> = new Set();

	// Active State
	let activeIndex = 0;
	let feedContainer: HTMLElement;
	let isAnimating = false;

	// Gestures
	let startY = 0;
	let currentDeltaY = 0;
	let isDragging = false;

	// Modals
	let showComments = false;
	let showPlaylist = false;
	let activeVideoId = '';

	const dispatch = createEventDispatcher();

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') window.removeEventListener('keydown', handleKeydown);
	});

	// --- ANIMATION / SWIPE LOGIC ---
	function animateToSlide(index: number) {
		if (!feedContainer) return;
		isAnimating = true;
		if (index < 0) index = 0;
		if (index >= videos.length) index = videos.length - 1;
		activeIndex = index;

		gsap.to(feedContainer, {
			yPercent: -100 * activeIndex,
			duration: 0.5,
			ease: 'power2.out',
			onComplete: () => {
				isAnimating = false;
			}
		});
	}

	function handleTouchStart(e: any) {
		if (isAnimating) return;
		// Ignore clicks on interactive elements
		if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.poll-container'))
			return;

		isDragging = true;
		startY = e.touches ? e.touches[0].clientY : e.clientY;
		gsap.killTweensOf(feedContainer);
	}

	function handleTouchMove(e: any) {
		if (!isDragging) return;
		const y = e.touches ? e.touches[0].clientY : e.clientY;
		const diff = y - startY;
		currentDeltaY = diff;
		const dragPercent = (diff / window.innerHeight) * 100;
		gsap.set(feedContainer, { yPercent: -100 * activeIndex + dragPercent });
	}

	function handleTouchEnd() {
		if (!isDragging) return;
		isDragging = false;
		if (currentDeltaY < -50 && activeIndex < videos.length - 1) animateToSlide(activeIndex + 1);
		else if (currentDeltaY > 50 && activeIndex > 0) animateToSlide(activeIndex - 1);
		else animateToSlide(activeIndex);
		currentDeltaY = 0;
	}

	function handleWheel(e: WheelEvent) {
		if (isAnimating) return;
		if (e.deltaY > 0) animateToSlide(activeIndex + 1);
		else if (e.deltaY < 0) animateToSlide(activeIndex - 1);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') animateToSlide(activeIndex + 1);
		else if (e.key === 'ArrowUp') animateToSlide(activeIndex - 1);
	}

	// --- HANDLERS FOR VIDEO REEL EVENTS ---
	function handleFollow(e: CustomEvent) {
		dispatch('follow', e.detail); // Bubble up
	}

	function handleSave(e: CustomEvent) {
		activeVideoId = e.detail;
		showPlaylist = true;
	}

	function handleComment(e: CustomEvent) {
		activeVideoId = e.detail;
		showComments = true;
	}

	function handlePlaylistChange(event: CustomEvent) {
		dispatch('playlistChange', event.detail);
	}
</script>

<div
	class="relative h-full w-full overflow-hidden bg-black touch-none"
	on:touchstart={handleTouchStart}
	on:touchmove={handleTouchMove}
	on:touchend={handleTouchEnd}
	on:mousedown={handleTouchStart}
	on:mousemove={handleTouchMove}
	on:mouseup={handleTouchEnd}
	on:wheel={handleWheel}
>
	<div bind:this={feedContainer} class="h-full w-full">
		{#each videos as video, i}
			<VideoReel
				{video}
				isActive={i === activeIndex}
				isFollowing={followedCreatorIds.has(video.profiles?.id || '')}
				isSaved={savedVideoIds.has(video.id)}
				on:follow={handleFollow}
				on:save={handleSave}
				on:comment={handleComment}
				on:like
				on:share
			/>
		{/each}
	</div>

	<!-- GLOBAL OVERLAYS (Rendered once at feed level) -->
	<Comments videoId={activeVideoId} isOpen={showComments} on:close={() => (showComments = false)} />
	<AddToPlaylist
		videoId={activeVideoId}
		isOpen={showPlaylist}
		on:close={() => (showPlaylist = false)}
		on:change={handlePlaylistChange}
	/>
</div>
