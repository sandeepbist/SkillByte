<script lang="ts">
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/userStore';
	import { onMount } from 'svelte';
	import type { Course, Video } from '$lib/types';
	import { fade, slide } from 'svelte/transition';

	let courseId = $page.params.id;
	let course: Course | null = null;
	let videos: Video[] = [];
	let completedVideoIds: Set<string> = new Set();
	let creator: any = null;

	let activeVideoIndex = 0;
	let loading = true;
	let videoEl: HTMLVideoElement;
	let showSidebar = true;

	$: progress = videos.length > 0 ? Math.round((completedVideoIds.size / videos.length) * 100) : 0;
	$: currentVideo = videos[activeVideoIndex];

	onMount(async () => {
		await fetchData();
	});

	async function fetchData() {
		if (!$user) return;

		// 1. Fetch Course & Creator Info
		const { data: cData } = await supabase
			.from('courses')
			.select('*, profiles(full_name, avatar_url)')
			.eq('id', courseId)
			.single();

		if (cData) {
			course = cData;
			// @ts-ignore
			creator = cData.profiles;
		}

		// 2. Fetch Course Videos
		const { data: vData } = await supabase
			.from('videos')
			.select('*')
			.eq('course_id', courseId)
			.order('course_order', { ascending: true });
		videos = vData || [];

		// 3. Fetch User Progress
		const { data: pData } = await supabase
			.from('video_completions')
			.select('video_id')
			.eq('user_id', $user.id);
		completedVideoIds = new Set(pData?.map((v) => v.video_id) || []);

		loading = false;
	}

	async function markComplete(videoId: string) {
		if (completedVideoIds.has(videoId)) return;

		completedVideoIds.add(videoId);
		completedVideoIds = completedVideoIds;

		await supabase.from('video_completions').insert({ user_id: $user?.id, video_id: videoId });
	}

	function handleVideoEnd() {
		markComplete(currentVideo.id);
		// Auto-advance logic
		if (activeVideoIndex < videos.length - 1) {
			setTimeout(() => activeVideoIndex++, 1000);
		}
	}
</script>

<div class="flex h-full w-full flex-col bg-[#050505] text-white overflow-hidden">
	{#if loading}
		<div class="flex flex-1 items-center justify-center">
			<div
				class="h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"
			></div>
		</div>
	{:else if course}
		<!-- HEADER -->
		<header
			class="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#0a0a0a] px-6"
		>
			<div class="flex items-center gap-4">
				<a
					href="/library"
					class="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-white"
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
						stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
					>
				</a>
				<div>
					<h1 class="text-sm font-bold text-white">{course.title}</h1>
					<p class="text-xs text-gray-500">by {creator?.full_name || 'Creator'}</p>
				</div>
			</div>

			<div class="flex items-center gap-6">
				<!-- Progress Bar -->
				<div class="hidden md:block w-48">
					<div
						class="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500"
					>
						<span>Progress</span>
						<span>{progress}%</span>
					</div>
					<div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
						<div
							class="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-500"
							style="width: {progress}%"
						></div>
					</div>
				</div>

				<button
					on:click={() => (showSidebar = !showSidebar)}
					class="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:bg-white/10 transition"
				>
					{showSidebar ? 'Hide Lessons' : 'Show Lessons'}
				</button>
			</div>
		</header>

		<!-- MAIN CONTENT -->
		<div class="flex flex-1 overflow-hidden">
			<!-- VIDEO AREA -->
			<div class="relative flex flex-1 items-center justify-center bg-black p-4 lg:p-8">
				{#if currentVideo}
					<div
						class="relative aspect-[9/16] h-full max-h-[85vh] w-auto overflow-hidden rounded-xl border border-white/10 bg-gray-900 shadow-2xl"
						in:fade={{ duration: 300 }}
					>
						<!-- svelte-ignore a11y-media-has-caption -->
						<video
							bind:this={videoEl}
							src={currentVideo.video_url}
							class="h-full w-full object-cover"
							controls
							autoplay
							on:ended={handleVideoEnd}
						></video>

						<!-- Overlay Title -->
						<div
							class="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none"
						>
							<h2 class="text-xl font-bold text-white drop-shadow-lg">{currentVideo.title}</h2>
						</div>
					</div>
				{:else}
					<p class="text-gray-500">No content available.</p>
				{/if}
			</div>

			<!-- SIDEBAR -->
			{#if showSidebar}
				<div
					transition:slide={{ axis: 'x', duration: 300 }}
					class="w-full md:w-80 lg:w-96 shrink-0 border-l border-white/5 bg-[#0a0a0a] flex flex-col"
				>
					<div class="p-4 border-b border-white/5">
						<h3 class="font-bold text-gray-200">Course Content</h3>
						<p class="text-xs text-gray-500 mt-1">
							{completedVideoIds.size} / {videos.length} completed
						</p>
					</div>

					<div class="flex-1 overflow-y-auto p-2 space-y-1">
						{#each videos as video, i}
							<button
								on:click={() => (activeVideoIndex = i)}
								class="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all group
								{activeVideoIndex === i
									? 'bg-white/10 border border-white/5'
									: 'hover:bg-white/5 border border-transparent'}"
							>
								<!-- Status Icon -->
								<div class="shrink-0">
									{#if activeVideoIndex === i}
										<div
											class="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg shadow-purple-500/30"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="12"
												height="12"
												viewBox="0 0 24 24"
												fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg
											>
										</div>
									{:else if completedVideoIds.has(video.id)}
										<div
											class="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-500 border border-green-500/30"
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
												stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg
											>
										</div>
									{:else}
										<div
											class="flex h-6 w-6 items-center justify-center rounded-full border border-gray-700 text-xs font-mono text-gray-500"
										>
											{i + 1}
										</div>
									{/if}
								</div>

								<div class="min-w-0 flex-1">
									<p
										class="text-sm font-medium truncate {activeVideoIndex === i
											? 'text-white'
											: 'text-gray-400 group-hover:text-gray-200'}"
									>
										{video.title}
									</p>
									<div class="flex items-center gap-2 mt-0.5">
										<span
											class="text-[10px] uppercase tracking-wider font-bold text-gray-600 bg-gray-800 px-1.5 rounded"
											>{video.difficulty}</span
										>
										<span class="text-[10px] text-gray-600">{video.duration_seconds || '60'}s</span>
									</div>
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
