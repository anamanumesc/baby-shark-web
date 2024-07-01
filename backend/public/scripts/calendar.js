document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['interaction', 'dayGrid', 'timeGrid'],
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                const response = await fetch('/api/get-sleep-times');
                const sleepTimes = await response.json();
                const events = sleepTimes.map(sleepTime => {
                    return {
                        title: 'Sleep',
                        start: `2023-01-01T${sleepTime.goToSleepTime}`,
                        end: `2023-01-01T${sleepTime.wakeUpTime}`,
                        allDay: false,
                        // Add recurrence rule here
                        rrule: {
                            freq: 'daily'
                        }
                    };
                });
                successCallback(events);
            } catch (error) {
                console.error('Error fetching sleep times:', error);
                failureCallback(error);
            }
        }
    });

    calendar.render();
});
