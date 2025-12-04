<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/userStore';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { Course } from '$lib/types';

	let courses: Course[] = [];
	let loading = true;
	let showCreateModal = false;

	// Create Form
	let newTitle = '';
	let newDesc = '';
	let creating = false;

	onMount(async () => {
		if (!$user) return goto('/login');
		fetchCourses();
	});

	async function fetchCourses() {
		const { data, error } = await supabase
			.from('courses')
			.select('*, videos(count)')
			.eq('creator_id', $user?.id)
			.order('created_at', { ascending: false });

		if (!error) courses = data || [];
		loading = false;
	}

	async function createCourse() {
		if (!newTitle.trim()) return;
		creating = true;

		const { data, error } = await supabase
			.from('courses')
			.insert({
				creator_id: $user?.id,
				title: newTitle,
				description: newDesc
			})
			.select()
			.single();

		if (!error && data) {
			goto(`/creator/courses/${data.id}`);
		} else {
			alert(error?.message);
			creating = false;
		}
	}
</script>

<div class="min-h-screen p-6 md:p-10 pt-24 bg-black text-white">
	<div class="max-w-5xl mx-auto">
		<!-- Header -->
		<div class="flex items-center justify-between mb-10">
			<div>
				<h1
					class="text-3xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent"
				>
					Micro-Courses
				</h1>
				<p class="text-gray-400 mt-1">Bundle your reels into structured learning paths.</p>
			</div>
			<button
				on:click={() => (showCreateModal = true)}
				class="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 px-6 rounded-lg transition shadow-lg shadow-yellow-500/20"
			>
				+ Create Course
			</button>
		</div>

		<!-- List -->
		{#if loading}
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
				{#each Array(3) as _}
					<div class="h-40 rounded-xl bg-gray-900 border border-gray-800"></div>
				{/each}
			</div>
		{:else if courses.length === 0}
			<div
				class="flex flex-col items-center justify-center py-20 border border-dashed border-gray-800 rounded-2xl bg-gray-900/30"
			>
				<p class="text-gray-500 text-lg">No courses yet.</p>
				<button
					on:click={() => (showCreateModal = true)}
					class="text-yellow-500 hover:underline mt-2">Create your first one</button
				>
			</div>
		{:else}
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each courses as course}
					<a
						href="/creator/courses/{course.id}"
						class="group block p-6 rounded-xl bg-gray-900 border border-white/10 hover:border-yellow-500/50 transition relative overflow-hidden"
					>
						<div
							class="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition"
						></div>

						<h3 class="text-xl font-bold text-white mb-2">{course.title}</h3>
						<p class="text-sm text-gray-400 line-clamp-2 mb-4 h-10">
							{course.description || 'No description'}
						</p>

						<div
							class="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wider"
						>
							<span>{course.videos ? course.videos[0].count : 0} Lessons</span>
							<!-- 'videos' here is the count object from select -->
							<span class="text-yellow-500 group-hover:translate-x-1 transition">Edit &rarr;</span>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Modal -->
	{#if showCreateModal}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
		>
			<div
				class="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
			>
				<h2 class="text-xl font-bold text-white mb-4">New Micro-Course</h2>

				<div class="space-y-4">
					<div>
						<label for="c-title" class="block text-xs font-medium text-gray-400 mb-1 uppercase"
							>Title</label
						>
						<input
							type="text"
							id="c-title"
							bind:value={newTitle}
							class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
							placeholder="e.g. Advanced TypeScript Patterns"
						/>
					</div>
					<div>
						<label for="c-desc" class="block text-xs font-medium text-gray-400 mb-1 uppercase"
							>Description</label
						>
						<textarea
							id="c-desc"
							bind:value={newDesc}
							rows="3"
							class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none resize-none"
							placeholder="What will students learn?"
						></textarea>
					</div>
				</div>

				<div class="flex gap-3 mt-6">
					<button
						on:click={() => (showCreateModal = false)}
						class="flex-1 py-3 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 font-medium"
						>Cancel</button
					>
					<button
						on:click={createCourse}
						disabled={creating || !newTitle}
						class="flex-1 py-3 rounded-lg bg-yellow-600 text-white hover:bg-yellow-500 font-bold disabled:opacity-50"
					>
						{creating ? 'Creating...' : 'Create'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
