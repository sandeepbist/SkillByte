<script lang="ts">
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/userStore';
	import { onMount } from 'svelte';
	import type { Course, Video } from '$lib/types';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	let courseId = $page.params.id;
	let course: Course | null = null;

	// Two lists: Videos IN the course, and Videos NOT in any course
	let courseVideos: Video[] = [];
	let availableVideos: Video[] = [];

	let loading = true;

	onMount(async () => {
		await fetchAllData();
	});

	async function fetchAllData() {
		if (!$user) return;

		// 1. Fetch Course Info
		const { data: cData } = await supabase.from('courses').select('*').eq('id', courseId).single();
		course = cData;

		// 2. Fetch Course Videos
		const { data: inCourse } = await supabase
			.from('videos')
			.select('*')
			.eq('course_id', courseId)
			.order('course_order', { ascending: true });
		courseVideos = inCourse || [];

		// 3. Fetch Available Videos (Where course_id is NULL)
		// We only want videos created by this user
		const { data: available } = await supabase
			.from('videos')
			.select('*')
			.eq('creator_id', $user.id)
			.is('course_id', null)
			.order('created_at', { ascending: false });
		availableVideos = available || [];

		loading = false;
	}

	// --- ACTIONS ---

	async function addToCourse(video: Video) {
		// Optimistic UI Update
		availableVideos = availableVideos.filter((v) => v.id !== video.id);
		const newOrder = courseVideos.length; // Add to end
		const updatedVideo = { ...video, course_id: courseId, course_order: newOrder };
		courseVideos = [...courseVideos, updatedVideo];

		// DB Update
		await supabase
			.from('videos')
			.update({ course_id: courseId, course_order: newOrder })
			.eq('id', video.id);
	}

	async function removeFromCourse(video: Video) {
		// Optimistic UI Update
		courseVideos = courseVideos.filter((v) => v.id !== video.id);
		const resetVideo = { ...video, course_id: undefined, course_order: 0 };
		availableVideos = [resetVideo, ...availableVideos];

		// DB Update
		await supabase.from('videos').update({ course_id: null, course_order: 0 }).eq('id', video.id);

		// Optional: Re-index remaining video orders in background
		reorderIndexes();
	}

	async function moveUp(index: number) {
		if (index === 0) return;
		// Swap in array
		[courseVideos[index], courseVideos[index - 1]] = [courseVideos[index - 1], courseVideos[index]];
		await reorderIndexes();
	}

	async function moveDown(index: number) {
		if (index === courseVideos.length - 1) return;
		// Swap in array
		[courseVideos[index], courseVideos[index + 1]] = [courseVideos[index + 1], courseVideos[index]];
		await reorderIndexes();
	}

	async function reorderIndexes() {
		// Update ALL orders in DB to match current array order
		// Ideally done in batch or SQL function, but loop works for small micro-courses
		for (let i = 0; i < courseVideos.length; i++) {
			const v = courseVideos[i];
			if (v.course_order !== i) {
				v.course_order = i; // Update local
				await supabase.from('videos').update({ course_order: i }).eq('id', v.id);
			}
		}
	}
</script>

<div class="min-h-screen pt-24 pb-10 px-4 md:px-8 bg-black text-white">
	{#if loading}
		<div class="flex justify-center mt-20">
			<div
				class="animate-spin h-8 w-8 border-2 border-yellow-500 rounded-full border-t-transparent"
			></div>
		</div>
	{:else if course}
		<div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- COLUMN 1: COURSE DETAILS & CONTENT (2/3 width) -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Header -->
				<div class="bg-[#111] p-6 rounded-2xl border border-white/10">
					<h1 class="text-3xl font-bold text-white mb-2">{course.title}</h1>
					<p class="text-gray-400">{course.description}</p>
					<div class="mt-4 flex items-center gap-2 text-sm text-yellow-500">
						<span class="bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20"
							>{courseVideos.length} Lessons</span
						>
						<span>• Drag & Drop Coming Soon</span>
					</div>
				</div>

				<!-- Curriculum List -->
				<div class="space-y-3">
					<h3 class="text-sm font-bold uppercase text-gray-500 tracking-wider">Curriculum</h3>

					{#if courseVideos.length === 0}
						<div
							class="p-8 border-2 border-dashed border-gray-800 rounded-xl text-center text-gray-500"
						>
							Add videos from the list on the right →
						</div>
					{:else}
						{#each courseVideos as video, i (video.id)}
							<div
								animate:flip={{ duration: 300 }}
								class="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-white/5 hover:border-white/20 transition group"
							>
								<!-- Order Badge -->
								<div
									class="h-8 w-8 shrink-0 rounded-full bg-white/5 flex items-center justify-center font-mono text-sm text-gray-400"
								>
									{i + 1}
								</div>

								<!-- Thumbnail/Preview -->
								<div class="h-12 w-8 shrink-0 bg-black rounded overflow-hidden">
									<video src={video.video_url} class="h-full w-full object-cover"></video>
								</div>

								<!-- Info -->
								<div class="flex-1 min-w-0">
									<h4 class="font-medium text-white truncate">{video.title}</h4>
									<span class="text-xs text-gray-500"
										>{video.difficulty} • {video.views_count} views</span
									>
								</div>

								<!-- Controls -->
								<div class="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition">
									<button
										on:click={() => moveUp(i)}
										disabled={i === 0}
										class="p-1.5 hover:text-white disabled:opacity-30">▲</button
									>
									<button
										on:click={() => moveDown(i)}
										disabled={i === courseVideos.length - 1}
										class="p-1.5 hover:text-white disabled:opacity-30">▼</button
									>
									<button
										on:click={() => removeFromCourse(video)}
										class="p-1.5 text-red-500 hover:bg-red-500/10 rounded ml-2"
									>
										✕
									</button>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>

			<!-- COLUMN 2: AVAILABLE REELS (1/3 width) -->
			<div class="lg:col-span-1">
				<div
					class="sticky top-28 bg-[#111] rounded-2xl border border-white/10 overflow-hidden flex flex-col max-h-[calc(100vh-150px)]"
				>
					<div class="p-4 border-b border-white/10 bg-white/5">
						<h3 class="font-bold text-white">Available Reels</h3>
						<p class="text-xs text-gray-400">Click + to add to course</p>
					</div>

					<div class="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
						{#if availableVideos.length === 0}
							<p class="p-4 text-center text-sm text-gray-500">No unused reels found.</p>
						{:else}
							{#each availableVideos as video (video.id)}
								<div
									transition:fade
									class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group cursor-pointer"
								>
									<div
										class="h-16 w-10 shrink-0 bg-black rounded overflow-hidden border border-white/10"
									>
										<video src={video.video_url} class="h-full w-full object-cover opacity-60"
										></video>
									</div>
									<div class="flex-1 min-w-0">
										<p class="text-sm font-medium text-gray-200 truncate">{video.title}</p>
										<p class="text-xs text-gray-500">
											{new Date(video.created_at).toLocaleDateString()}
										</p>
									</div>
									<button
										on:click={() => addToCourse(video)}
										class="h-8 w-8 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition"
									>
										+
									</button>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Custom scrollbar for the side panel */
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #333;
		border-radius: 3px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
