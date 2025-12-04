<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/userStore';
	import { onMount } from 'svelte';
	import type { Poll } from '$lib/types';
	import { fly } from 'svelte/transition';

	export let videoId: string;

	let poll: Poll | null = null;
	let hasVoted = false;
	let totalVotes = 0;
	let voteCounts: number[] = [];
	let loading = true;

	onMount(() => {
		fetchPoll();
	});

	async function fetchPoll() {
		// 1. Get Poll Data
		const { data: polls } = await supabase
			.from('polls')
			.select('*')
			.eq('video_id', videoId)
			.limit(1);

		if (polls && polls.length > 0) {
			const p = polls[0];
			poll = { ...p, options: p.options }; // Ensure options is typed correctly

			// 2. Get Votes Count
			const { data: votes } = await supabase.from('poll_votes').select('option_index');

			if (votes) {
				// Initialize counts
				voteCounts = new Array(poll?.options.length).fill(0);
				votes.forEach((v) => {
					if (v.option_index !== null) voteCounts[v.option_index]++;
				});
				totalVotes = votes.length;
			}

			// 3. Check if current user voted
			if ($user) {
				const { data: myVote } = await supabase
					.from('poll_votes')
					.select('*')
					.eq('poll_id', p.id)
					.eq('user_id', $user.id)
					.maybeSingle();

				if (myVote) hasVoted = true;
			}
		}
		loading = false;
	}

	async function vote(index: number) {
		if (!$user || hasVoted || !poll) return;

		// Optimistic Update
		hasVoted = true;
		voteCounts[index]++;
		totalVotes++;

		await supabase.from('poll_votes').insert({
			poll_id: poll.id,
			user_id: $user.id,
			option_index: index
		});
	}
</script>

{#if poll}
	<div
		class="absolute bottom-32 left-4 z-30 w-64 rounded-xl bg-black/60 p-4 text-white backdrop-blur-md border border-white/10 shadow-lg md:left-4"
		transition:fly={{ x: -50, duration: 500 }}
	>
		<div class="mb-3 flex items-start gap-2">
			<span class="mt-1 flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
			<h4 class="text-sm font-bold leading-tight">{poll.question}</h4>
		</div>

		<div class="space-y-2">
			{#each poll.options as option, i}
				{@const percent = totalVotes > 0 ? Math.round((voteCounts[i] / totalVotes) * 100) : 0}

				<button
					class="relative w-full overflow-hidden rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-left text-xs font-medium transition active:scale-95 hover:bg-white/10"
					disabled={hasVoted}
					on:click={() => vote(i)}
				>
					<!-- Progress Bar Background -->
					{#if hasVoted}
						<div
							class="absolute top-0 left-0 bottom-0 bg-blue-500/30 transition-all duration-1000"
							style="width: {percent}%"
						></div>
					{/if}

					<div class="relative z-10 flex justify-between">
						<span>{option}</span>
						{#if hasVoted}
							<span class="font-bold">{percent}%</span>
						{/if}
					</div>
				</button>
			{/each}
		</div>
		<p class="mt-2 text-[10px] text-gray-400 text-right">{totalVotes} votes</p>
	</div>
{/if}
