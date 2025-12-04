<script lang="ts">
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/userStore';
	import { onMount } from 'svelte';
	import type { Profile, Course, Video } from '$lib/types';
	import { fade } from 'svelte/transition';

	let profileId = $page.params.id;
	let profile: Profile | null = null;
	let courses: Course[] = [];
	let reels: Video[] = [];

	let isFollowing = false;
	let activeTab: 'courses' | 'reels' = 'courses';
	let loading = true;

	onMount(async () => {
		await fetchProfileData();
	});

	async function fetchProfileData() {
		loading = true;

		// 1. Profile
		const { data: pData } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', profileId)
			.single();
		profile = pData;

		// 2. Check Follow
		if ($user && $user.id !== profileId) {
			const { data } = await supabase
				.from('follows')
				.select('*')
				.match({ follower_id: $user.id, following_id: profileId })
				.maybeSingle();
			isFollowing = !!data;
		}

		// 3. Courses
		const { data: cData } = await supabase
			.from('courses')
			.select('*, videos(count)')
			.eq('creator_id', profileId)
			.order('created_at', { ascending: false });
		courses = cData || [];

		// 4. Reels
		const { data: rData } = await supabase
			.from('videos')
			.select('*')
			.eq('creator_id', profileId)
			.order('created_at', { ascending: false });
		reels = rData || [];

		loading = false;
	}

	async function toggleFollow() {
		if (!$user) return;
		isFollowing = !isFollowing;
		if (isFollowing) {
			await supabase.from('follows').insert({ follower_id: $user.id, following_id: profileId });
		} else {
			await supabase
				.from('follows')
				.delete()
				.match({ follower_id: $user.id, following_id: profileId });
		}
	}
</script>

<div class="min-h-screen bg-[#050505] text-white">
	{#if loading}
		<div class="flex h-[50vh] items-center justify-center">
			<div
				class="h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"
			></div>
		</div>
	{:else if profile}
		<!-- HERO HEADER -->
		<div class="relative bg-gradient-to-b from-gray-900 via-[#111] to-[#050505] pb-10 pt-24 px-6">
			<!-- Absolute glow -->
			<div
				class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-purple-900/10 blur-[100px] pointer-events-none"
			></div>

			<div
				class="relative max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-8"
			>
				<!-- Avatar -->
				<div class="relative group">
					<div class="h-32 w-32 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-blue-500">
						<div
							class="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden border-4 border-black"
						>
							{#if profile.avatar_url}
								<img src={profile.avatar_url} alt="Profile" class="h-full w-full object-cover" />
							{:else}
								<span class="text-4xl font-bold text-white">{profile.full_name?.[0]}</span>
							{/if}
						</div>
					</div>
				</div>

				<!-- Info -->
				<div class="flex-1 text-center md:text-left">
					<h1 class="text-3xl md:text-4xl font-bold text-white mb-2">{profile.full_name}</h1>
					<p class="text-gray-400 mb-4 max-w-lg mx-auto md:mx-0 leading-relaxed">
						{profile.bio || 'Sharing knowledge, one byte at a time.'}
					</p>

					<div class="flex items-center justify-center md:justify-start gap-6 text-sm">
						<div class="text-center md:text-left">
							<span class="block font-bold text-white text-lg">{courses.length}</span>
							<span class="text-gray-500">Courses</span>
						</div>
						<div class="text-center md:text-left">
							<span class="block font-bold text-white text-lg">{reels.length}</span>
							<span class="text-gray-500">Reels</span>
						</div>
					</div>
				</div>

				<!-- Action -->
				{#if $user?.id !== profile.id}
					<button
						on:click={toggleFollow}
						class="px-8 py-2.5 rounded-full font-bold transition shadow-lg hover:scale-105 active:scale-95
						{isFollowing
							? 'bg-gray-800 text-white border border-white/10'
							: 'bg-white text-black hover:bg-gray-200'}"
					>
						{isFollowing ? 'Following' : 'Follow'}
					</button>
				{/if}
			</div>
		</div>

		<!-- CONTENT TABS -->
		<div class="max-w-5xl mx-auto px-6 pb-20">
			<div class="flex justify-center border-b border-white/10 mb-10">
				<button
					class="pb-4 px-8 text-sm font-bold uppercase tracking-wider border-b-2 transition relative {activeTab ===
					'courses'
						? 'border-purple-500 text-white'
						: 'border-transparent text-gray-500 hover:text-gray-300'}"
					on:click={() => (activeTab = 'courses')}
				>
					Micro-Courses
				</button>
				<button
					class="pb-4 px-8 text-sm font-bold uppercase tracking-wider border-b-2 transition relative {activeTab ===
					'reels'
						? 'border-purple-500 text-white'
						: 'border-transparent text-gray-500 hover:text-gray-300'}"
					on:click={() => (activeTab = 'reels')}
				>
					Reels
				</button>
			</div>

			<!-- GRID -->
			{#if activeTab === 'courses'}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" in:fade>
					{#each courses as course}
						<a
							href="/course/{course.id}"
							class="group block bg-gray-900 border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/30 transition hover:shadow-2xl hover:shadow-purple-900/10"
						>
							<div
								class="h-32 bg-gradient-to-br from-gray-800 to-black p-6 flex flex-col justify-end relative overflow-hidden"
							>
								<div
									class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition"
								></div>
								<h3 class="text-xl font-bold relative z-10 group-hover:translate-x-1 transition">
									{course.title}
								</h3>
							</div>
							<div class="p-5">
								<p class="text-sm text-gray-400 line-clamp-2 mb-4 h-10">
									{course.description || 'Master this skill in minutes.'}
								</p>
								<div
									class="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wide"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg
									>
									{course.videos?.[0]?.count || 0} Lessons
								</div>
							</div>
						</a>
					{/each}
					{#if courses.length === 0}
						<div
							class="col-span-full py-20 text-center text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10"
						>
							<p>No courses published yet.</p>
						</div>
					{/if}
				</div>
			{:else}
				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" in:fade>
					{#each reels as reel}
						<div
							class="aspect-[9/16] bg-gray-800 rounded-xl overflow-hidden relative group border border-white/5 hover:border-white/20 transition"
						>
							<video
								src={reel.video_url}
								class="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition"
							></video>
							<div
								class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent"
							>
								<p class="text-sm font-bold text-white truncate">{reel.title}</p>
								<div class="flex justify-between items-center mt-1">
									<span class="text-[10px] text-gray-400">{reel.views_count} views</span>
									<span
										class="text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-gray-300"
										>{reel.difficulty}</span
									>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
