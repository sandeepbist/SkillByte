<script lang="ts">
	import { supabase, uploadVideoFile } from '$lib/supabaseClient';
	import { user } from '$lib/userStore';
	import { goto } from '$app/navigation';
	import type { SkillLevel } from '$lib/types';
	import { onMount } from 'svelte';

	let title = '';
	let description = '';
	let tagsInput = '';
	let difficulty: SkillLevel = 'beginner';
	let videoFile: File | null = null;

	let uploading = false;
	let message = '';
	let isDragging = false;

	// --- SECURITY: Protect Route ---
	// If user is not logged in OR not a creator, kick them out.
	$: if ($user) {
		const role = $user.user_metadata?.role;
		if (role !== 'creator') {
			goto('/'); // Redirect learners to home silently
		}
	}

	onMount(() => {
		if (!$user) goto('/login');
	});

	const handleFileChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			videoFile = target.files[0];
		}
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			const file = e.dataTransfer.files[0];
			if (file.type.startsWith('video/')) {
				videoFile = file;
			} else {
				alert('Please upload a video file.');
			}
		}
	};

	const handleUpload = async () => {
		if (!$user) return alert('You must be logged in');
		if (!videoFile) return alert('Please select a video');

		uploading = true;
		message = 'Uploading your masterpiece...';

		try {
			// 1. Upload file
			const publicUrl = await uploadVideoFile(videoFile, $user.id);

			// 2. Save metadata
			const { error: dbError } = await supabase.from('videos').insert({
				creator_id: $user.id,
				title,
				description,
				video_url: publicUrl,
				difficulty,
				tags: tagsInput.split(',').map((t) => t.trim()),
				duration_seconds: 0
			});

			if (dbError) throw dbError;

			message = 'Success! Redirecting...';
			setTimeout(() => goto('/'), 1000);
		} catch (error: any) {
			console.error(error);
			message = `Error: ${error.message}`;
			uploading = false;
		}
	};
</script>

<div class="flex min-h-full items-center justify-center p-4">
	<div class="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold tracking-tight text-white">Upload Byte</h1>
			<p class="mt-2 text-gray-400">Share knowledge in 60 seconds or less.</p>
		</div>

		<form
			on:submit|preventDefault={handleUpload}
			class="space-y-6 rounded-2xl bg-gray-900/50 p-8 border border-white/10 backdrop-blur-sm shadow-2xl"
		>
			<!-- Drag & Drop Area -->
			<div
				class="relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300
				{isDragging
					? 'border-purple-500 bg-purple-500/10'
					: 'border-gray-700 bg-gray-800/50 hover:border-gray-500'}"
				on:dragover|preventDefault={() => (isDragging = true)}
				on:dragleave={() => (isDragging = false)}
				on:drop={handleDrop}
				on:click={() => document.getElementById('video')?.click()}
			>
				{#if videoFile}
					<div class="text-center">
						<div
							class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-400"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg
							>
						</div>
						<p class="font-medium text-white">{videoFile.name}</p>
						<p class="text-sm text-gray-500">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
					</div>
				{:else}
					<div class="text-center">
						<div
							class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-gray-400"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline
									points="17 8 12 3 7 8"
								/><line x1="12" x2="12" y1="3" y2="15" /></svg
							>
						</div>
						<p class="font-medium text-gray-300">Click to upload or drag video</p>
						<p class="text-sm text-gray-500">MP4, WebM (Max 60s)</p>
					</div>
				{/if}
				<input
					type="file"
					id="video"
					accept="video/*"
					class="hidden"
					on:change={handleFileChange}
				/>
			</div>

			<!-- Meta Data Inputs -->
			<div class="grid gap-6 md:grid-cols-2">
				<div class="space-y-2">
					<label for="title" class="text-sm font-medium text-gray-300">Title</label>
					<input
						type="text"
						id="title"
						bind:value={title}
						class="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
						placeholder="e.g. React Hooks in 60s"
						required
					/>
				</div>

				<div class="space-y-2">
					<label for="difficulty" class="text-sm font-medium text-gray-300">Level</label>
					<select
						id="difficulty"
						bind:value={difficulty}
						class="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white focus:border-purple-500 outline-none transition"
					>
						<option value="beginner">Beginner</option>
						<option value="intermediate">Intermediate</option>
						<option value="advanced">Advanced</option>
					</select>
				</div>
			</div>

			<div class="space-y-2">
				<label for="desc" class="text-sm font-medium text-gray-300">Description</label>
				<textarea
					id="desc"
					bind:value={description}
					rows="3"
					class="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white focus:border-purple-500 outline-none transition resize-none"
					placeholder="What will they learn?"
				></textarea>
			</div>

			<div class="space-y-2">
				<label for="tags" class="text-sm font-medium text-gray-300">Tags</label>
				<input
					type="text"
					id="tags"
					bind:value={tagsInput}
					class="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white focus:border-purple-500 outline-none transition"
					placeholder="javascript, coding, webdev (comma separated)"
				/>
			</div>

			<button
				type="submit"
				disabled={uploading || !videoFile}
				class="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 py-3.5 font-bold text-white shadow-lg transition hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{uploading ? 'Publishing...' : 'Publish Byte'}
			</button>

			{#if message}
				<div
					class="mt-4 rounded-lg bg-gray-800 p-3 text-center text-sm font-medium text-purple-300 border border-purple-500/20"
				>
					{message}
				</div>
			{/if}
		</form>
	</div>
</div>
