import { json } from '@sveltejs/kit';
import { drowsinessState } from '$lib/drowsinessState.js';

export async function POST({ request }) {
    const data = await request.json();
    const { driverId, type, isDrowsy, startTime, endTime, image } = data;

    console.log(`[SERVER LOG] Received Data for ${driverId}: Type=${type || 'alert'}`);

    if (!drowsinessState.drivers[driverId]) {
        drowsinessState.drivers[driverId] = {
            isDrowsy: false,
            logs: []
        };
    }

    if (type === 'connect') {
        // Just registering the driver is enough as we did above
        return json({ success: true });
    }

    const driver = drowsinessState.drivers[driverId];
    driver.isDrowsy = isDrowsy;

    if (isDrowsy) {
        // Start of drowsiness event
        // Create a new log entry
        driver.logs.unshift({
            startTime: startTime,
            endTime: null,
            startImage: image,
            endImage: null
        });
    } else {
        // End of drowsiness event
        // Find the latest log that hasn't ended
        const activeLog = driver.logs.find(log => !log.endTime);
        if (activeLog) {
            activeLog.endTime = endTime;
            activeLog.endImage = image;
        } else {
            // Fallback if we missed the start event for some reason
            driver.logs.unshift({
                startTime: startTime, // Might be null if not passed
                endTime: endTime,
                startImage: null,
                endImage: image
            });
        }
    }

    return json({ success: true });
}

export function GET() {
    return json(drowsinessState);
}
