document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek'
        },
        views: {
            timeGridWeek: {
                buttonText: 'Week'
            }
        },
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                const token = getCookie('clientToken');

                // Fetch sleep times
                const sleepResponse = await fetch('/api/get-sleep-times', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Check if the sleep response is okay
                if (!sleepResponse.ok) {
                    throw new Error(`Sleep API error! status: ${sleepResponse.status}`);
                }

                // Fetch nap times
                const napResponse = await fetch('/api/get-nap-times', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Check if the nap response is okay
                if (!napResponse.ok) {
                    throw new Error(`Nap API error! status: ${napResponse.status}`);
                }

                const sleepTimes = await sleepResponse.json();
                const napTimes = await napResponse.json();

                console.log('Fetched sleep times:', sleepTimes);
                console.log('Fetched nap times:', napTimes);

                if (!Array.isArray(sleepTimes) || !Array.isArray(napTimes)) {
                    throw new Error('Expected sleepTimes and napTimes to be arrays');
                }

                // Function to extract hour as a number from a time string in HH:MM format
                function extractHour(timeStr) {
                    return Number(timeStr.split(':')[0]);
                }

                const events = [];

                // Add sleep events
                sleepTimes.forEach(sleepTime => {
                    const goToSleepTimeHour = extractHour(sleepTime.goToSleepTime);
                    const wakeUpTimeHour = extractHour(sleepTime.wakeUpTime);

                    console.log('goToSleepTimeHour:', goToSleepTimeHour, 'wakeUpTimeHour:', wakeUpTimeHour);

                    if (goToSleepTimeHour >= wakeUpTimeHour) {
                        console.log('Interval passes through midnight');
                        // Split event: before and after midnight
                        events.push({
                            title: 'Sleep',
                            startTime: '00:00:00',
                            endTime: sleepTime.wakeUpTime,
                            startRecur: fetchInfo.startStr,
                            endRecur: fetchInfo.endStr,
                            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                            display: 'block',
                            backgroundColor: '#ADD8E6'
                        });
                        events.push({
                            title: 'Sleep',
                            startTime: sleepTime.goToSleepTime,
                            endTime: '23:59:59',
                            startRecur: fetchInfo.startStr,
                            endRecur: fetchInfo.endStr,
                            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                            display: 'block',
                            backgroundColor: '#ADD8E6'
                        });
                    } else {
                        console.log('Interval within a single day');
                        // Normal event
                        events.push({
                            title: 'Sleep',
                            startTime: sleepTime.goToSleepTime,
                            endTime: sleepTime.wakeUpTime,
                            startRecur: fetchInfo.startStr,
                            endRecur: fetchInfo.endStr,
                            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                            display: 'block',
                            backgroundColor: '#ADD8E6'
                        });
                    }
                });

                // Add nap events
                napTimes.forEach(napTime => {
                    const startNapTimeHour = extractHour(napTime.startNapTime);
                    const endNapTimeHour = extractHour(napTime.endNapTime);

                    console.log('startNapTimeHour:', startNapTimeHour, 'endNapTimeHour:', endNapTimeHour);

                    if (startNapTimeHour >= endNapTimeHour) {
                        console.log('Interval passes through midnight');
                        // Split event: before and after midnight
                        events.push({
                            title: 'Nap',
                            startTime: '00:00:00',
                            endTime: napTime.endNapTime,
                            startRecur: fetchInfo.startStr,
                            endRecur: fetchInfo.endStr,
                            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                            display: 'block',
                            backgroundColor: '#FFD700'
                        });
                        events.push({
                            title: 'Nap',
                            startTime: napTime.startNapTime,
                            endTime: '23:59:59',
                            startRecur: fetchInfo.startStr,
                            endRecur: fetchInfo.endStr,
                            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                            display: 'block',
                            backgroundColor: '#FFD700'
                        });
                    } else {
                        console.log('Interval within a single day');
                        // Normal event
                        events.push({
                            title: 'Nap',
                            startTime: napTime.startNapTime,
                            endTime: napTime.endNapTime,
                            startRecur: fetchInfo.startStr,
                            endRecur: fetchInfo.endStr,
                            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                            display: 'block',
                            backgroundColor: '#FFD700'
                        });
                    }
                });

                successCallback(events);

            } catch (error) {
                console.error('Error fetching sleep and nap times:', error);
                failureCallback(error);
            }
        },
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        },
        slotMinTime: '00:00:00',
        slotMaxTime: '24:00:00',
        allDaySlot: false
    });

    calendar.render();
});

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, ...cookieParts] = cookie.split('=');
        const trimmedCookieName = cookieName.trim();
        if (trimmedCookieName === name) {
            return decodeURIComponent(cookieParts.join('='));
        }
    }
    return null;
}
