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
                const response = await fetch('/api/get-sleep-times', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const sleepTimes = await response.json();
                console.log('Fetched sleep times:', sleepTimes);

                if (!Array.isArray(sleepTimes)) {
                    throw new Error('Expected sleepTimes to be an array');
                }

                // Function to extract hour as a number from a time string in HH:MM format
                function extractHour(timeStr) {
                    return Number(timeStr.split(':')[0]);
                }

                const events = [];
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

                successCallback(events);

            } catch (error) {
                console.error('Error fetching sleep times:', error);
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
