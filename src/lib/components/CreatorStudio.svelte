<script lang="ts">
	import type { Video } from '$lib/types';

	export let videos: Video[] = [];
</script>

<div class="h-full w-full overflow-y-auto p-6 md:p-10 select-text bg-black text-white">
	<header class="mb-10 flex justify-between">
		<h1 class="text-3xl font-bold">Creator Studio</h1>
		<a
			href="/creator/upload"
			class="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black shadow hover:bg-gray-200 transition"
			>+ New Reel</a
		>
	</header>
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
		{#each videos as video}
			<div
				class="aspect-[9/16] rounded-xl bg-gray-900 border border-white/10 overflow-hidden relative group"
			>
				<video
					src={video.video_url}
					class="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition"
				></video>
				<div
					class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent"
				>
					<p class="font-bold text-white truncate">{video.title}</p>
					<p class="text-xs text-gray-400">{video.views_count} views</p>
				</div>
			</div>
		{/each}
		{#if videos.length === 0}
			<div class="col-span-full py-12 text-center text-gray-500">
				No reels yet. Upload your first byte!
			</div>
		{/if}
	</div>
</div>
