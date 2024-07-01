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

                const mealResponse = await fetch('/api/get-meal-times', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!mealResponse.ok) {
                    throw new Error(`Meal API error! status: ${mealResponse.status}`);
                }

                const mealTimes = await mealResponse.json();

                console.log('Fetched meal times:', mealTimes);

                if (!Array.isArray(mealTimes)) {
                    throw new Error('Expected mealTimes to be an array');
                }

                const events = [];

                mealTimes.forEach(mealTime => {
                    const startTimeHour = extractHour(mealTime.startTime);
                    const endTimeHour = extractHour(mealTime.endTime);

                    console.log('startTimeHour:', startTimeHour, 'endTimeHour:', endTimeHour);

                    if (startTimeHour >= endTimeHour) {
                        console.log('Interval passes through midnight');
                        events.push({
                            title: mealTime.description,
                            startTime: '00:00:00',
                            endTime: mealTime.endTime,
                            startRecur: fetchInfo.startStr,
                            endRecur: fetchInfo.endStr,
                            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                            display: 'block',
                            backgroundColor: '#FF6347'
                        });
                        events.push({
                            title: mealTime.description,
                            startTime: mealTime.startTime,
                            endTime: '23:59:59',
                            startRecur: fetchInfo.startStr,
                            endRecur: fetchInfo.endStr,
                            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                            display: 'block',
                            backgroundColor: '#FF6347'
                        });
                    } else {
                        console.log('Interval within a single day');
                        // Normal event
                        events.push({
                            title: mealTime.description,
                            startTime: mealTime.startTime,
                            endTime: mealTime.endTime,
                            startRecur: fetchInfo.startStr,
                            endRecur: fetchInfo.endStr,
                            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                            display: 'block',
                            backgroundColor: '#FF6347'
                        });
                    }
                });

                successCallback(events);

            } catch (error) {
                console.error('Error fetching meal times:', error);
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

function extractHour(timeStr) {
    return Number(timeStr.split(':')[0]);
}

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
