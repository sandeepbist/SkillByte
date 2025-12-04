<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/userStore';
	import { onMount, createEventDispatcher } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import type { Comment } from '$lib/types';

	export let videoId: string;
	export let isOpen = false;

	let comments: Comment[] = [];
	let newComment = '';
	let loading = true;
	let submitting = false;

	const dispatch = createEventDispatcher();

	$: if (isOpen && videoId) fetchComments();

	async function fetchComments() {
		loading = true;
		const { data, error } = await supabase
			.from('comments')
			.select('*, profiles(full_name, avatar_url)')
			.eq('video_id', videoId)
			.order('created_at', { ascending: false });

		if (!error && data) {
			// @ts-ignore
			comments = data;
		}
		loading = false;
	}

	async function postComment() {
		if (!newComment.trim() || !$user) return;
		submitting = true;

		const { error } = await supabase.from('comments').insert({
			video_id: videoId,
			user_id: $user.id,
			text: newComment
		});

		if (!error) {
			newComment = '';
			fetchComments(); // Refresh
		}
		submitting = false;
	}

	function close() {
		dispatch('close');
	}
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
		transition:fade
		on:click={close}
	></div>

	<!-- Drawer Panel -->
	<div
		class="fixed bottom-0 left-0 right-0 z-50 h-[60vh] rounded-t-3xl bg-[#111] border-t border-white/10 shadow-2xl flex flex-col md:max-w-md md:mx-auto md:h-[70vh] md:rounded-3xl md:bottom-10"
		transition:fly={{ y: 300, duration: 300 }}
	>
		<!-- Handle Bar -->
		<div class="flex justify-center pt-3 pb-1" on:click={close}>
			<div class="h-1.5 w-12 rounded-full bg-gray-700"></div>
		</div>

		<!-- Header -->
		<div class="border-b border-white/10 px-6 py-4 flex justify-between items-center">
			<h3 class="text-lg font-bold text-white">
				Comments <span class="text-gray-500 text-sm">({comments.length})</span>
			</h3>
			<button class="text-gray-400 hover:text-white" on:click={close}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg
				>
			</button>
		</div>

		<!-- List -->
		<div class="flex-1 overflow-y-auto p-6 space-y-6">
			{#if loading}
				<div class="space-y-4 animate-pulse">
					<div class="h-10 bg-gray-800 rounded"></div>
					<div class="h-10 bg-gray-800 rounded"></div>
				</div>
			{:else if comments.length === 0}
				<p class="text-center text-gray-500 mt-10">No comments yet. Start the conversation!</p>
			{:else}
				{#each comments as comment}
					<div class="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
						<div
							class="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs border border-white/20"
						>
							{comment.profiles?.full_name?.[0] || 'U'}
						</div>
						<div class="flex-1">
							<div class="flex items-baseline gap-2">
								<span class="text-sm font-bold text-gray-200"
									>{comment.profiles?.full_name || 'User'}</span
								>
								<span class="text-[10px] text-gray-500"
									>{new Date(comment.created_at).toLocaleDateString()}</span
								>
							</div>
							<p class="text-sm text-gray-300 mt-0.5 leading-relaxed">{comment.text}</p>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Input -->
		<div class="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
			<form class="flex gap-2" on:submit|preventDefault={postComment}>
				<input
					type="text"
					bind:value={newComment}
					placeholder="Add a comment..."
					class="flex-1 rounded-full bg-gray-800 border border-gray-700 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition"
				/>
				<button
					type="submit"
					disabled={!newComment.trim() || submitting}
					class="rounded-full bg-blue-600 px-4 py-2 font-bold text-white disabled:opacity-50 hover:bg-blue-500 transition"
				>
					Send
				</button>
			</form>
		</div>
	</div>
{/if}
