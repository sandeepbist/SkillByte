<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { browser } from '$app/environment';

	onMount(() => {
		if (browser) initLandingAnimations();
	});

	function initLandingAnimations() {
		// Hero Text Stagger
		gsap.fromTo(
			'.hero-anim',
			{ opacity: 0, y: 30 },
			{ opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
		);
		// Phone Mockup Float
		gsap.fromTo(
			'.mockup-float',
			{ y: 20 },
			{ y: -20, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' }
		);
	}
</script>

<div
	class="relative flex h-full w-full flex-col lg:flex-row items-center justify-center overflow-hidden bg-black px-6 lg:px-20 gap-10 lg:gap-20"
>
	<!-- Background Glows -->
	<div
		class="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-[150px] pointer-events-none"
	></div>
	<div
		class="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[150px] pointer-events-none"
	></div>

	<!-- Left: Content -->
	<div class="z-10 max-w-2xl text-center lg:text-left flex flex-col items-center lg:items-start">
		<div
			class="hero-anim mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-purple-300 backdrop-blur-md"
		>
			<span class="relative flex h-2 w-2">
				<span
					class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"
				></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
			</span>
			The Future of Micro-Learning
		</div>

		<h1 class="hero-anim mb-6 text-5xl font-extrabold tracking-tight sm:text-7xl leading-[1.1]">
			Master Skills in <br class="hidden lg:block" />
			<span
				class="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
			>
				60 Seconds
			</span>
		</h1>

		<p class="hero-anim mb-8 text-lg text-gray-400 sm:text-xl leading-relaxed max-w-lg">
			Stop watching 2-hour tutorials. SkillByte gives you a personalized, infinite feed of coding
			wisdom. Swipe to learn.
		</p>

		<div class="hero-anim flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
			<a
				href="/login"
				class="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 transition transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)] text-center"
			>
				Start Learning
			</a>
			<a
				href="/login"
				class="px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition text-center"
			>
				Creator Login
			</a>
		</div>
	</div>

	<!-- Right: 3D Mockup -->
	<div class="mockup-float hidden lg:block relative z-10 perspective-1000">
		<!-- Phone Frame -->
		<div
			class="w-[300px] h-[600px] bg-gray-900 rounded-[2.5rem] border-[8px] border-gray-800 shadow-2xl overflow-hidden relative rotate-y-12 rotate-x-6 transform transition hover:rotate-0 hover:scale-105 duration-500"
		>
			<!-- Fake Screen Content -->
			<div class="absolute inset-0 bg-black flex flex-col">
				<!-- Mock Video Gradient -->
				<div class="flex-1 bg-gradient-to-br from-indigo-900 to-purple-900 relative">
					<div class="absolute bottom-20 left-4 right-4">
						<div class="h-4 w-20 bg-white/20 rounded mb-2"></div>
						<div class="h-3 w-40 bg-white/10 rounded"></div>
					</div>
					<div class="absolute bottom-24 right-2 flex flex-col gap-3">
						<div class="h-10 w-10 rounded-full bg-white/10"></div>
						<div class="h-10 w-10 rounded-full bg-white/10"></div>
					</div>
				</div>
				<!-- Fake Nav -->
				<div
					class="h-14 bg-black/80 backdrop-blur border-t border-white/10 flex justify-around items-center px-4"
				>
					<div class="h-6 w-6 rounded bg-white/20"></div>
					<div class="h-6 w-6 rounded bg-white/20"></div>
					<div class="h-6 w-6 rounded bg-purple-500"></div>
				</div>
			</div>
		</div>
		<!-- Glow behind phone -->
		<div class="absolute inset-0 bg-purple-500/30 blur-[80px] -z-10"></div>
	</div>
</div>

<style>
	/* CSS for 3D Transform */
	.perspective-1000 {
		perspective: 1000px;
	}
	.rotate-y-12 {
		transform: rotateY(-12deg) rotateX(5deg);
	}
</style>
