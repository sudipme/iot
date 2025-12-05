<script>
    import { page } from "$app/stores";
    import { onMount, onDestroy } from "svelte";

    const driverId = $page.params.id;
    let driverData = null;
    let interval;
    let selectedImage = null;

    async function fetchStatus() {
        try {
            const res = await fetch("/api/drowsiness");
            if (res.ok) {
                const state = await res.json();
                driverData = state.drivers[driverId];
            }
        } catch (e) {
            console.error("Error fetching status:", e);
        }
    }

    onMount(() => {
        fetchStatus();
        interval = setInterval(fetchStatus, 1000);
    });

    onDestroy(() => {
        clearInterval(interval);
    });

    function formatTime(isoString) {
        if (!isoString) return "-";
        return new Date(isoString).toLocaleTimeString();
    }

    function getDuration(start, end) {
        if (!start || !end) return "-";
        const diff = new Date(end) - new Date(start);
        return (diff / 1000).toFixed(1) + "s";
    }

    function openModal(image) {
        selectedImage = image;
    }

    function closeModal() {
        selectedImage = null;
    }
</script>

<main>
    <div class="header">
        <a href="/" class="back">&larr; Back</a>
        <h1>Driver: {driverId}</h1>
    </div>

    {#if driverData}
        <div class="status-banner" class:drowsy={driverData.isDrowsy}>
            Current Status: <strong
                >{driverData.isDrowsy ? "DROWSY" : "Active"}</strong
            >
        </div>

        <table>
            <thead>
                <tr>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration</th>
                    <th>Start Image</th>
                    <th>End Image</th>
                </tr>
            </thead>
            <tbody>
                {#each driverData.logs as log}
                    <tr>
                        <td>{formatTime(log.startTime)}</td>
                        <td>{formatTime(log.endTime)}</td>
                        <td>{getDuration(log.startTime, log.endTime)}</td>
                        <td>
                            {#if log.startImage}
                                <button
                                    class="thumb-btn"
                                    on:click={() => openModal(log.startImage)}
                                >
                                    <img
                                        src="data:image/jpeg;base64,{log.startImage}"
                                        alt="Start"
                                        class="thumb"
                                    />
                                </button>
                            {:else}
                                -
                            {/if}
                        </td>
                        <td>
                            {#if log.endImage}
                                <button
                                    class="thumb-btn"
                                    on:click={() => openModal(log.endImage)}
                                >
                                    <img
                                        src="data:image/jpeg;base64,{log.endImage}"
                                        alt="End"
                                        class="thumb"
                                    />
                                </button>
                            {:else}
                                -
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else}
        <p>Loading or Driver not found...</p>
    {/if}

    {#if selectedImage}
        <div class="modal-backdrop" on:click={closeModal}>
            <div class="modal-content" on:click|stopPropagation>
                <img
                    src="data:image/jpeg;base64,{selectedImage}"
                    alt="Full size"
                />
                <button class="close-btn" on:click={closeModal}>Close</button>
            </div>
        </div>
    {/if}
</main>

<style>
    main {
        font-family: "Inter", sans-serif;
        max-width: 1000px;
        margin: 0 auto;
        padding: 2rem;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .back {
        text-decoration: none;
        color: #666;
        font-weight: bold;
    }

    .status-banner {
        padding: 1rem;
        background: #e0ffe0;
        border-radius: 8px;
        margin-bottom: 2rem;
        border: 1px solid #ccc;
    }

    .status-banner.drowsy {
        background: #ffe0e0;
        border-color: #ff0000;
        color: #c0392b;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th,
    td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #eee;
    }

    th {
        background: #f8f9fa;
    }

    .thumb {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #ddd;
    }

    .thumb-btn {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
    }

    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .modal-content img {
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
    }

    .close-btn {
        align-self: flex-end;
        padding: 0.5rem 1rem;
        background: #333;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
</style>
