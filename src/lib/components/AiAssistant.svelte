<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import type { Video } from '$lib/types';

	export let video: Video;
	export let isOpen = false;

	const dispatch = createEventDispatcher();
	let loading = false;
	let result = '';
	let mode: 'summary' | 'quiz' | 'practice' | null = null;

	const apiKey = 'AIzaSyBaZO5i5iLqmFPwtYfqaOVv4FSSkzgYEjw'; 

	async function generate(selectedMode: 'summary' | 'quiz' | 'practice') {
		mode = selectedMode;
		loading = true;
		result = '';

		const promptContext = `
			VIDEO CONTEXT:
			- Title: "${video.title}"
			- Description: "${video.description || 'Educational coding tutorial'}"
			- Skill Level: ${video.difficulty}
			- Topics/Tags: ${video.tags?.join(', ') || 'General Programming'}
			- Duration: ${video.duration_seconds || 60} seconds

			TASK:
			You are an expert AI Tutor who has analyzed this educational video.
			Your goal is to help a student learn the concepts presented.
		`;

		let userPrompt = '';

		if (selectedMode === 'summary') {
			userPrompt = `
				Based on the video title "${video.title}" and its description, provide a comprehensive summary of the lesson.

				Structure:
				1. **Core Concept**: What is the main idea?
				2. **Key Takeaways**: 3 distinct bullet points explaining the likely code or concepts shown.
				3. **Real-World Use**: One sentence on when to use this.
			`;
		} else if (selectedMode === 'quiz') {
			userPrompt = `
				Create a 3-question multiple-choice quiz to test understanding of "${video.title}".

				Structure:
				- Question 1 (Conceptual)
				- Question 2 (Syntax/Implementation based on likely code)
				- Question 3 (Problem Solving)

				Format:
				**Q1:** [Question]
				a) [Option]
				b) [Option]
				c) [Option]
				*Answer:* [Correct Option]
			`;
		} else {
			userPrompt = `
				Generate 2 advanced practice scenarios for a student who just watched "${video.title}".

				Structure:
				1. **Coding Challenge**: Describe a small function they should try to write.
				2. **Discussion Question**: A deeper question about trade-offs or best practices related to ${video.tags?.[0] || 'this topic'}.
			`;
		}

		// Append the footer requirement to every prompt
		userPrompt += `
			\n\n
			IMPORTANT: At the very end of your response, strictly append a footer separator and the following metadata block:
			---
			**Source Material:** ${video.title}
			**Tags:** #${video.tags?.join(' #') || 'learning'}
		`;

		try {
			const response = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						contents: [
							{
								role: 'user',
								parts: [{ text: promptContext }, { text: userPrompt }]
							}
						],
						generationConfig: {
							temperature: 0.7,
							topK: 40,
							topP: 0.95,
							maxOutputTokens: 1024
						}
					})
				}
			);

			const data = await response.json();

			if (data.error) {
				console.error('Gemini API Error:', data.error);
				throw new Error(data.error.message || 'API Error');
			}

			// Extract text
			result =
				data.candidates?.[0]?.content?.parts?.[0]?.text ||
				"I watched the video but couldn't generate a response. Please try again.";
		} catch (err: any) {
			console.error('Generation failed:', err);
			result =
				"Sorry, I'm having trouble connecting to the AI Tutor network. Please check your connection and try again.";
		} finally {
			loading = false;
		}
	}

	function close() {
		dispatch('close');
		setTimeout(() => {
			mode = null;
			result = '';
		}, 300);
	}
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div
		class="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		on:click={close}
	></div>

	<!-- Sidebar -->
	<div
		class="absolute right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-[#111] border-l border-white/10 shadow-2xl flex flex-col h-full"
		transition:fly={{ x: 300, duration: 300 }}
	>
		<!-- Header -->
		<div
			class="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-900/20 to-blue-900/20 shrink-0"
		>
			<div class="flex items-center gap-2 text-purple-400">
				<div class="p-1.5 bg-purple-500/10 rounded-lg animate-pulse">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path
							d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
						/><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line
							x1="12"
							y1="22.08"
							x2="12"
							y2="12"
						/></svg
					>
				</div>
				<h3 class="font-bold text-white tracking-wide">AI Tutor</h3>
			</div>
			<button
				on:click={close}
				class="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
			>
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

		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
			{#if !mode}
				<div class="flex flex-col h-full justify-center">
					<div class="mb-8 text-center">
						<h4 class="text-white font-bold text-lg mb-2">Analyze Content</h4>
						<p class="text-gray-400 text-xs px-4 leading-relaxed">
							I can "watch" this reel and generate personalized learning materials for you.
						</p>
					</div>

					<div class="grid gap-4">
						<button
							on:click={() => generate('summary')}
							class="flex items-center gap-4 p-4 rounded-xl bg-gray-800/40 border border-white/5 hover:border-purple-500/50 hover:bg-gray-800 transition text-left group relative overflow-hidden"
						>
							<div
								class="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"
							></div>
							<div
								class="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition relative z-10"
							>
								📝
							</div>
							<div class="relative z-10">
								<div class="font-bold text-white mb-0.5 group-hover:text-purple-300">
									Summarize Reel
								</div>
								<div class="text-[11px] text-gray-500 group-hover:text-gray-400">
									Key takeaways & code concepts
								</div>
							</div>
						</button>

						<button
							on:click={() => generate('quiz')}
							class="flex items-center gap-4 p-4 rounded-xl bg-gray-800/40 border border-white/5 hover:border-blue-500/50 hover:bg-gray-800 transition text-left group relative overflow-hidden"
						>
							<div
								class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"
							></div>
							<div
								class="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition relative z-10"
							>
								❓
							</div>
							<div class="relative z-10">
								<div class="font-bold text-white mb-0.5 group-hover:text-blue-300">
									Generate Quiz
								</div>
								<div class="text-[11px] text-gray-500 group-hover:text-gray-400">
									Test your retention instantly
								</div>
							</div>
						</button>

						<button
							on:click={() => generate('practice')}
							class="flex items-center gap-4 p-4 rounded-xl bg-gray-800/40 border border-white/5 hover:border-green-500/50 hover:bg-gray-800 transition text-left group relative overflow-hidden"
						>
							<div
								class="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"
							></div>
							<div
								class="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition relative z-10"
							>
								💡
							</div>
							<div class="relative z-10">
								<div class="font-bold text-white mb-0.5 group-hover:text-green-300">
									Practice Ideas
								</div>
								<div class="text-[11px] text-gray-500 group-hover:text-gray-400">
									Apply concepts to real projects
								</div>
							</div>
						</button>
					</div>
				</div>
			{:else}
				<button
					on:click={() => {
						mode = null;
						result = '';
					}}
					class="text-xs text-gray-500 hover:text-white mb-6 flex items-center gap-1 transition"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
					>
					Back to options
				</button>

				{#if loading}
					<div class="flex flex-col items-center justify-center py-20 space-y-6">
						<div class="relative">
							<div
								class="h-16 w-16 rounded-full border-4 border-white/5 border-t-purple-500 animate-spin"
							></div>
							<div class="absolute inset-0 flex items-center justify-center">
								<div class="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
							</div>
						</div>
						<div class="text-center">
							<p class="text-sm text-white font-bold mb-1">Analyzing "{video.title}"...</p>
							<p class="text-xs text-gray-500">Extracting insights from the byte.</p>
						</div>
					</div>
				{:else}
					<div class="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
						<h3 class="text-lg font-bold text-white mb-4 capitalize border-b border-white/10 pb-2">
							{mode === 'quiz'
								? 'Knowledge Check'
								: mode === 'summary'
									? 'Byte Summary'
									: 'Practice Plan'}
						</h3>

						<div class="prose prose-invert prose-sm max-w-none">
							<div class="text-gray-300 leading-relaxed space-y-4">
								<!-- Enhanced Markdown Rendering -->
								{@html result
									.replace(
										/\*\*(.*?)\*\*/g,
										'<strong class="text-purple-300 font-bold">$1</strong>'
									) // Bold
									.replace(
										/^# (.*$)/gm,
										'<h1 class="text-xl font-bold text-white mt-4 mb-2">$1</h1>'
									) // H1
									.replace(
										/^## (.*$)/gm,
										'<h2 class="text-lg font-bold text-white mt-4 mb-2">$1</h2>'
									) // H2
									.replace(
										/^\* (.*$)/gm,
										'<li class="ml-4 list-disc marker:text-purple-500">$1</li>'
									) // List items
									.replace(/\n/g, '<br/>')}
							</div>
						</div>

						<!-- Sticky Bottom Action -->
						<div
							class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#111] to-transparent"
						>
							<button
								on:click={() => {
									mode = null;
									result = '';
								}}
								class="w-full py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-200 transition shadow-lg hover:shadow-white/10 flex items-center justify-center gap-2"
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
									stroke-linejoin="round"
									><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path
										d="M3 3v5h5"
									/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path
										d="M16 21h5v-5"
									/></svg
								>
								Start Over
							</button>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: #111;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #333;
		border-radius: 2px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
