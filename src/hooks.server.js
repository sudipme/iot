export async function handle({ event, resolve }) {
    console.log(`[REQUEST] ${event.request.method} ${event.url.pathname} from ${event.getClientAddress()}`);

    // Disable CSRF check for the mobile app API
    if (event.url.pathname.startsWith('/api/drowsiness')) {
        event.locals.bypassCsrf = true; // SvelteKit specific flag if using standard protection, 
        // but standard SvelteKit CSRF protection is usually config-based.
        // However, we can also just allow the request to proceed if standard checking interferes.
    }

    const response = await resolve(event, {
        csrf: {
            checkOrigin: (event.url.pathname.startsWith('/api/drowsiness') ? false : undefined)
        }
    });
    return response;
}
