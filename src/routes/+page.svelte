<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import ender_eye from "../lib/assets/ender_eye.png";

    onMount(() => {
        setTimeout(() => {
            goto("/widget");
        }, 2000);
    });
</script>

<div
    class="w-full h-full flex items-center justify-center text-neutral-200 bg-neutral-900 flex-col gap-4"
>
    <div class="flex gap-4 items-center">
        <img
            src={ender_eye}
            alt=""
            class="w-16 h-16"
            style="image-rendering:pixelated"
        />
        <p class="text-center text-xl">Olof's Ninjabrain Overlay</p>
    </div>

    <p class="text-lg text-neutral-500">"Loading"...</p>
</div>
