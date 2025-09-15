<script lang="ts">
    import type { Snippet } from "svelte";

    const { children, full = false }: { children: Snippet; full?: boolean } =
        $props();
</script>

<div
    class="flex w-fit flex-col border-[6px] border-[#1B1E1D] text-[#cfcfcf]"
    class:w-full={full}
    class:h-full={full}
>
    <span
        class="border-4 border-[#6D6F71] bg-[#484A49]"
        class:w-full={full}
        class:h-full={full}
    >
        {@render children()}</span
    >
    <span id="shadow" class="h-3 w-full bg-[#313433]"></span>
</div>
