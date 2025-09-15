<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/ender_eye.png";
	import { getCurrentWindow } from "@tauri-apps/api/window";

	let { children } = $props();

	const appWindow = getCurrentWindow();
	let is_over = $state(false);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Olof's Ninjabrain Overlay</title>
</svelte:head>

<div class="w-dvw h-dvh flex flex-col font-mc">
	{@render children?.()}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		onmousedown={(e) => {
			is_over = !is_over;
			if (e.buttons === 1) {
				appWindow.startDragging();
			}
		}}
		class={[
			"absolute w-full h-full top-0 left-0 z-50",
			is_over && "bg-neutral-950/50",
		]}
		data-tauri-drag-region
	></div>
</div>
