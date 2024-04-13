document.getElementById('generateButton').addEventListener('click', function() {
    var numNaps = parseInt(document.getElementById('numNaps').value, 10);
    var napTimesContainer = document.getElementById('napTimesContainer');

    napTimesContainer.innerHTML = '';

    for (var i = 1; i <= numNaps; i++) {
        var napLabel = document.createElement('label');
        napLabel.textContent = 'Nap ' + i + ' times:';
        napTimesContainer.appendChild(napLabel);

        for (var j = 1; j <= 2; j++) {
            var napInput = document.createElement('input');
            napInput.type = 'time';
            napInput.name = 'napTime' + i + '-' + j;
            napInput.required = true;
            napTimesContainer.appendChild(napInput);
        }

        napTimesContainer.appendChild(document.createElement('br'));
    }

    var submitButton = document.getElementById('submitButton');
    submitButton.classList.remove('hidden');
    napTimesContainer.appendChild(submitButton);
});
