<script>
    import { onMount, onDestroy } from "svelte";

    let state = { drivers: {} };
    let interval;

    async function fetchStatus() {
        try {
            const res = await fetch("/api/drowsiness");
            if (res.ok) {
                state = await res.json();
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
</script>

<main>
    <h1>Fleet Drowsiness Monitor</h1>

    <div class="grid">
        {#each Object.entries(state.drivers) as [driverId, data]}
            <a
                href="/driver/{driverId}"
                class="card"
                class:drowsy={data.isDrowsy}
            >
                <h2>{driverId}</h2>
                <p class="status">{data.isDrowsy ? "DROWSY!" : "Active"}</p>
                <p class="count">Events: {data.logs.length}</p>
            </a>
        {/each}

        {#if Object.keys(state.drivers).length === 0}
            <p class="empty">No drivers connected yet.</p>
        {/if}
    </div>
</main>

<style>
    main {
        font-family: "Inter", sans-serif;
        max-width: 1000px;
        margin: 0 auto;
        padding: 2rem;
    }

    h1 {
        text-align: center;
        margin-bottom: 2rem;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
    }

    .card {
        display: block;
        text-decoration: none;
        color: inherit;
        border: 1px solid #ddd;
        border-radius: 12px;
        padding: 1.5rem;
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition:
            transform 0.2s,
            box-shadow 0.2s;
    }

    .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .card.drowsy {
        background-color: #ffe0e0;
        border-color: #ff0000;
        animation: pulse 1s infinite;
    }

    h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
    }

    .status {
        font-weight: bold;
        color: #2ecc71;
    }

    .card.drowsy .status {
        color: #e74c3c;
    }

    .count {
        color: #666;
        font-size: 0.9rem;
    }

    .empty {
        text-align: center;
        color: #888;
        grid-column: 1 / -1;
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.02);
        }
        100% {
            transform: scale(1);
        }
    }
</style>
