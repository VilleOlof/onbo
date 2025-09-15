<script lang="ts">
    import {
        angle_diff,
        type Blind,
        BLIND_MAP,
        BLIND_PERCENTAGE_MAP,
        type Boat,
        BOAT_MAP,
        chunk_to_global,
        get_certainty_color,
        get_compass_from_angle,
        type Stronghold,
    } from "$lib";
    import Container from "$lib/Container.svelte";
    import { onMount } from "svelte";
    import ender_eye from "$lib/assets/ender_eye.png";
    import dark_boat from "$lib/assets/boats/boat_dark.png";
    import { listen, type Event } from "@tauri-apps/api/event";
    import { invoke } from "@tauri-apps/api/core";

    let data = $state<Stronghold | null>(null);
    let boat = $state<Boat | null>(null);
    let blind = $state<Blind | null>(null);
    $inspect(blind);
    let error = $state<string | null>(null);

    let is_visible = $state<boolean>(true);
    let latest_data_time = Date.now();
    const TIMEOUT_SECONDS: number = 3 * 60 * 1000; // 3 minutes
    const new_data = () => {
        latest_data_time = Date.now();
        is_visible = true;
        error = null;
    };

    onMount(async () => {
        const un_stronghold = await listen(
            "nb_stronghold",
            (e: Event<string>) => {
                data = JSON.parse(e.payload);
                new_data();
            },
        );
        const un_boat = await listen("nb_boat", (e: Event<string>) => {
            boat = JSON.parse(e.payload);
            new_data();
        });
        const un_blind = await listen("nb_blind", (e: Event<string>) => {
            blind = JSON.parse(e.payload);
            new_data();
        });
        const un_error = await listen("nb_error", (e: Event<string>) => {
            error = e.payload;
            new_data();
        });

        const interval = setInterval(() => {
            if (Date.now() > latest_data_time + TIMEOUT_SECONDS) {
                is_visible = false;
            }
        }, 1000);

        await invoke("frontend_loaded");

        () => {
            un_stronghold();
            un_boat();
            un_blind();
            un_error();
            clearInterval(interval);
        };
    });
</script>

<div class="bg-transparent w-fit h-fit p-2">
    {#if data !== null && error === null && is_visible && data.resultType == "TRIANGULATION"}
        {@const angle = angle_diff(
            data.predictions[0],
            data.playerPosition,
            data.playerPosition.horizontalAngle,
        )}

        <Container>
            <div class="w-fit h-fit flex p-1 gap-4 flex-col">
                <div class="flex justify-center gap-4">
                    <div class="relative w-20 h-20">
                        <img
                            src={ender_eye}
                            alt=""
                            style="image-rendering:pixelated;"
                            class="w-full h-full drop-shadow-xl drop-shadow-neutral-950/50"
                        />
                        <p
                            class="absolute bottom-0 right-0 text-4xl text-white text-shadow-lg text-shadow-neutral-950"
                        >
                            {data.eyeThrows.length}
                        </p>
                        <p class="absolute top-0 right-0">
                            {data.eyeThrows[data.eyeThrows.length - 1]
                                .correction > 0
                                ? "+"
                                : ""}{data.eyeThrows[
                                data.eyeThrows.length - 1
                            ].correction.toFixed(2)}
                        </p>
                    </div>

                    <img
                        src={boat ? BOAT_MAP[boat.boatState] : dark_boat}
                        alt=""
                        class="w-20 h-20 drop-shadow-xl drop-shadow-neutral-950/50"
                        style="image-rendering:pixelated;"
                    />

                    <div class="relative w-20 h-20 flex">
                        <img
                            src={get_compass_from_angle(angle + 180)}
                            alt=""
                            style="image-rendering:pixelated;"
                            class="w-full h-full drop-shadow-xl drop-shadow-neutral-950/50"
                        />
                        <p
                            class="absolute w-full text-center bottom-0 right-0 text-md text-white text-shadow-lg text-shadow-neutral-950"
                        >
                            {angle > 0 ? ">" : "<"}
                            {Math.abs(angle).toFixed(1)}
                        </p>
                    </div>

                    <img
                        src={data.playerPosition.isInNether
                            ? "netherrack.webp"
                            : "grass_block.webp"}
                        alt=""
                        style="image-rendering:pixelated;"
                        class="w-20 h-20 drop-shadow-xl drop-shadow-neutral-950/50"
                    />
                </div>

                <div class="flex flex-col gap-2 text-2xl">
                    <div class="flex justify-between">
                        <p class="w-48 mc-border text-center">Location</p>
                        <p class="w-24 mc-border text-center">%</p>
                        <p class="w-24 mc-border text-center">Dist.</p>
                    </div>
                    {#each data.predictions.slice(0, 2) as prediction}
                        {@const distance = data.playerPosition.isInNether
                            ? Math.floor(prediction.overworldDistance / 8)
                            : prediction.overworldDistance}
                        {@const x = chunk_to_global(prediction.chunkX)}
                        {@const z = chunk_to_global(prediction.chunkZ)}

                        <div class="mc-border flex gap-1">
                            <p class="w-48 text-center">
                                {#if data.playerPosition.isInNether}
                                    {Math.floor(x / 8)} {Math.floor(z / 8)}
                                {:else}
                                    {x} {z}
                                {/if}
                            </p>
                            <p
                                class="w-24 text-center"
                                style="color:{get_certainty_color(
                                    prediction.certainty * 100,
                                )}"
                            >
                                {(prediction.certainty * 100).toFixed(1)}%
                            </p>
                            <p class="w-24 text-center">
                                {distance.toFixed(0)}
                            </p>
                        </div>
                    {/each}
                </div>
            </div>
        </Container>
    {:else if error !== null}
        <p class="bg-neutral-900 p-4 text-red-500">{error}</p>
    {:else if data?.resultType === "BLIND" && blind?.blindResult?.xInNether}
        <Container>
            <div
                class="w-[25.5rem] h-60 flex justify-center items-center flex-col gap-2"
            >
                <p>
                    Blinds coords ({blind.blindResult.xInNether.toFixed(0)}, {blind.blindResult.zInNether.toFixed(
                        0,
                    )}) are
                </p>
                <span
                    class="text-shadow-lg drop-shadow-neutral-950 text-3xl"
                    style="color:{get_certainty_color(
                        BLIND_PERCENTAGE_MAP[blind.blindResult.evaluation],
                    )}">{BLIND_MAP[blind.blindResult.evaluation]}</span
                >
                <p>
                    <span
                        style="color:{get_certainty_color(
                            blind.blindResult.highrollProbability * 800,
                        )}"
                        >{(blind.blindResult.highrollProbability * 100).toFixed(
                            1,
                        )}%</span
                    >
                    chance of {"<"}{blind.blindResult.highrollThreshold} block blind
                </p>
                <p>
                    Head {(
                        blind.blindResult.improveDirection *
                        (180 / Math.PI)
                    ).toFixed(0)}°, {blind.blindResult.improveDistance.toFixed(
                        0,
                    )} blocks away
                </p>
            </div>
        </Container>
    {:else if data?.resultType === "FAILED"}
        <Container>
            <div>
                <div class="w-fit h-fit flex p-1 gap-4 flex-col">
                    <p class="text-balance text-center">
                        Could not determine the stronghold chunk.<br /><br />
                        You probably misread one of the eyes.
                    </p>

                    <div class="flex flex-col">
                        {#each data.eyeThrows.toReversed().slice(0, 2) as eye}
                            <div class="mc-border px-2 flex justify-between">
                                <p>
                                    x{eye.xInOverworld.toFixed(0)} z{eye.zInOverworld.toFixed(
                                        0,
                                    )}
                                </p>
                                <p>angle: {eye.angle.toFixed(2)}</p>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </Container>
    {:else if data?.resultType === "NONE" || !is_visible}
        <!-- we just hide it, but its still there on the users screen and draggable -->
    {:else}
        <Container>
            <div class="w-[25.5rem] h-60 flex justify-center items-center">
                <p class="text-4xl">No data yet...</p>
            </div>
        </Container>
    {/if}
</div>
