<script lang="ts">
	import type { Video } from '$lib/types';
	import Poll from '$lib/components/Poll.svelte';
	import AiAssistant from '$lib/components/AiAssistant.svelte';
	import { createEventDispatcher } from 'svelte';
	import { gsap } from 'gsap';

	export let video: Video;
	export let isActive = false;
	export let isFollowing = false;
	export let isSaved = false;

	const dispatch = createEventDispatcher();
	let videoEl: HTMLVideoElement;
	let showAi = false;

	// Reactively play/pause based on active state
	$: if (videoEl) {
		if (isActive) {
			videoEl.currentTime = 0;
			videoEl.play().catch(() => {});
		} else {
			videoEl.pause();
		}
	}

	function togglePlay() {
		if (videoEl.paused) videoEl.play();
		else videoEl.pause();
	}

	function animateHeart(btn: HTMLElement) {
		const icon = btn.querySelector('svg');
		if (icon)
			gsap.fromTo(
				icon,
				{ scale: 1 },
				{ scale: 1.5, color: '#ef4444', duration: 0.15, yoyo: true, repeat: 1 }
			);
	}
</script>

<div
	class="relative h-full w-full flex justify-center items-center bg-black overflow-hidden shrink-0 snap-start"
>
	<!-- svelte-ignore a11y-media-has-caption -->
	<video
		bind:this={videoEl}
		src={video.video_url}
		class="h-full w-full object-cover md:h-[95%] md:w-auto md:aspect-[9/16] md:rounded-2xl shadow-2xl"
		playsinline
		loop
		muted={false}
		on:click={togglePlay}
	></video>

	<!-- AI ASSISTANT OVERLAY -->
	<AiAssistant {video} isOpen={showAi} on:close={() => (showAi = false)} />

	<!-- POLL COMPONENT -->
	<div
		class="poll-container pointer-events-auto"
		on:touchstart|stopPropagation
		on:mousedown|stopPropagation
	>
		<Poll videoId={video.id} />
	</div>

	<!-- RIGHT SIDE ACTIONS -->
	<div
		class="absolute bottom-32 right-3 flex flex-col gap-5 items-center z-20 md:right-[calc(50%-220px)]"
	>
		<!-- 0. AI MAGIC BUTTON (NEW) -->
		<button
			class="group flex flex-col items-center gap-1 pointer-events-auto"
			on:click|stopPropagation={() => (showAi = true)}
		>
			<div class="transition active:scale-90 group-hover:scale-110 relative">
				<div
					class="absolute inset-0 bg-purple-500 blur-lg opacity-20 group-hover:opacity-50 transition rounded-full"
				></div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="30"
					height="30"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-purple-400 drop-shadow-md relative z-10"
				>
					<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
					<path d="M8.5 8.5v.01" />
					<path d="M16 15.5v.01" />
					<path d="M12 12v.01" />
					<path d="M7 17v.01" />
					<path d="M17 7v.01" />
				</svg>
			</div>
			<span class="text-[10px] font-bold drop-shadow-md text-purple-200">AI Tutor</span>
		</button>

		<!-- 1. CREATOR AVATAR (LINKED) -->
		<div class="relative h-10 w-10 mb-2">
			<a
				href="/profile/{video.profiles?.id}"
				on:click|stopPropagation
				class="block h-full w-full rounded-full border-2 border-white bg-gray-800 flex items-center justify-center overflow-hidden hover:scale-105 transition"
			>
				{#if video.profiles?.avatar_url}
					<img src={video.profiles.avatar_url} alt="Creator" class="h-full w-full object-cover" />
				{:else}
					<span class="font-bold text-sm">{video.profiles?.full_name?.[0] || 'U'}</span>
				{/if}
			</a>

			<!-- Follow Button (Small Plus) -->
			{#if video.profiles && !isFollowing}
				<button
					on:click|stopPropagation={() => dispatch('follow', video.profiles?.id)}
					class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center border border-white hover:scale-110 transition cursor-pointer pointer-events-auto shadow-sm"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="10"
						height="10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="4"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="text-white"
					>
						<line x1="12" x2="12" y1="5" y2="19" />
						<line x1="5" x2="19" y1="12" y2="12" />
					</svg>
				</button>
			{/if}
		</div>

		<!-- 2. LIKE -->
		<button
			class="group flex flex-col items-center gap-1 pointer-events-auto"
			on:click={(e) => {
				e.stopPropagation();
				animateHeart(e.currentTarget);
				dispatch('like', video.id);
			}}
		>
			<div class="transition active:scale-90 group-hover:scale-110">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="30"
					height="30"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-white drop-shadow-md"
				>
					<path
						d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
					/>
				</svg>
			</div>
			<span class="text-[10px] font-bold drop-shadow-md">Like</span>
		</button>

		<!-- 3. COMMENTS -->
		<button
			class="group flex flex-col items-center gap-1 pointer-events-auto"
			on:click|stopPropagation={() => dispatch('comment', video.id)}
		>
			<div class="transition active:scale-90 group-hover:scale-110">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="30"
					height="30"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-white drop-shadow-md"
				>
					<path
						d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
					/>
				</svg>
			</div>
			<span class="text-[10px] font-bold drop-shadow-md">Chat</span>
		</button>

		<!-- 4. SAVE (PLAYLIST) -->
		<button
			class="group flex flex-col items-center gap-1 pointer-events-auto"
			on:click|stopPropagation={() => dispatch('save', video.id)}
		>
			<div class="transition active:scale-90 group-hover:scale-110">
				{#if isSaved}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="30"
						height="30"
						viewBox="0 0 24 24"
						fill="currentColor"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="text-yellow-400 drop-shadow-md"
					>
						<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="30"
						height="30"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="text-white drop-shadow-md"
					>
						<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
					</svg>
				{/if}
			</div>
			<span class="text-[10px] font-bold drop-shadow-md">{isSaved ? 'Saved' : 'Save'}</span>
		</button>

		<!-- 5. SHARE -->
		<button
			class="group flex flex-col items-center gap-1 pointer-events-auto"
			on:click|stopPropagation={() => dispatch('share', video.id)}
		>
			<div class="transition active:scale-90 group-hover:scale-110">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="30"
					height="30"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-white drop-shadow-md"
				>
					<circle cx="18" cy="5" r="3" />
					<circle cx="6" cy="12" r="3" />
					<circle cx="18" cy="19" r="3" />
					<line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
					<line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
				</svg>
			</div>
			<span class="text-[10px] font-bold drop-shadow-md">Share</span>
		</button>
	</div>

	<!-- BOTTOM OVERLAY (INFO) -->
	<div
		class="absolute bottom-0 left-0 w-full p-4 pb-8 z-20 md:max-w-xl md:left-[50%] md:-translate-x-1/2 pointer-events-none"
	>
		<div class="flex items-center gap-3 mb-2 pointer-events-auto">
			<!-- CREATOR NAME (LINKED) -->
			<a
				href="/profile/{video.profiles?.id}"
				on:click|stopPropagation
				class="text-white font-bold text-lg drop-shadow-md hover:text-purple-300 transition"
			>
				@{video.profiles?.full_name?.replace(/\s+/g, '').toLowerCase() || 'creator'}
			</a>

			<!-- Inline Follow Button -->
			{#if video.profiles && !isFollowing}
				<button
					on:click|stopPropagation={() => dispatch('follow', video.profiles?.id)}
					class="border border-white/40 bg-transparent px-3 py-1 rounded-md text-xs font-semibold text-white backdrop-blur-md hover:bg-white/20 transition"
				>
					Follow
				</button>
			{:else if video.profiles}
				<button
					on:click|stopPropagation={() => dispatch('follow', video.profiles?.id)}
					class="border border-white/20 bg-white/10 px-3 py-1 rounded-md text-xs font-semibold text-gray-300 backdrop-blur-md hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition group"
				>
					<span class="group-hover:hidden">Following</span>
					<span class="hidden group-hover:inline">Unfollow</span>
				</button>
			{/if}
		</div>

		<div class="pointer-events-auto">
			<p class="text-white text-sm leading-relaxed mb-2 drop-shadow-md max-w-[85%]">
				<span class="font-bold mr-1">{video.title}</span>
				{video.description || ''}
			</p>
		</div>

		<div class="flex flex-wrap gap-2 items-center pointer-events-auto">
			<span
				class="text-[10px] uppercase tracking-wider font-bold text-black bg-white/90 px-2 py-0.5 rounded shadow-lg"
				>{video.difficulty}</span
			>
			{#each video.tags || [] as tag}
				<span class="text-xs font-bold text-white drop-shadow-md">#{tag}</span>
			{/each}
		</div>
	</div>
</div>
