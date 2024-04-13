document.getElementById('generateButton').addEventListener('click', function() {
    var numMeals = parseInt(document.getElementById('numMeals').value, 10);
    var mealDescriptionsContainer = document.getElementById('mealDescriptionsContainer');

    mealDescriptionsContainer.innerHTML = '';

    for (var i = 1; i <= numMeals; i++) {
        var mealLabel = document.createElement('label');
        mealLabel.textContent = 'Meal ' + i + ' description:';
        mealDescriptionsContainer.appendChild(mealLabel);

        var mealInput = document.createElement('textarea');
        mealInput.name = 'mealDescription' + i;
        mealInput.required = true;
        mealDescriptionsContainer.appendChild(mealInput);

        mealDescriptionsContainer.appendChild(document.createElement('br'));
    }

    var submitButton = document.getElementById('submitButton');
    submitButton.classList.remove('hidden');
    mealDescriptionsContainer.appendChild(submitButton);
});
