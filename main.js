$(document).ready(function(){
    console.log("ready!");

    fetch("https://raw.githubusercontent.com/jmaciassf/examQuestions/main/Salesforce-Developer-I.json") .then((response) => response.json())
    .then(function(response){

        // Random array order
        response = response.sort(function () {
            return Math.random() - 0.5;
        });

        var optionCounter = 0;
        response.forEach(element => {
            console.log(element);

            if(!element.question || !element.options)
                return;
                
            var arrOptions = []
            element.options.forEach(function(option, index){
                var answer = false
                if(index == 0 && element.answers.includes('A')) answer = true;
                if(index == 1 && element.answers.includes('B')) answer = true;
                if(index == 2 && element.answers.includes('C')) answer = true;
                if(index == 3 && element.answers.includes('D')) answer = true;
                
                arrOptions.push({ text: option, answer: answer });
            });

            // Random array order
            arrOptions = arrOptions.sort(function () {
                return Math.random() - 0.5;
            });
            
            var options = '';
            arrOptions.forEach(function(option){
                optionCounter++;
                var idOption = "option"+optionCounter;
                options += 
                `<label class="option" for="${idOption}" answer="${option.answer}">
                    <input type="checkbox" id="${idOption}"><span class="text">${option.text}</span>
                </label>`;
            });

            $("#items").append(
            `<div class="item">
                <div class="question">${element.question}</div>
                <div class="options">${options}</div>
            </div>`
            );
        });

    }).catch(function(error) {
    console.log('Hubo un problema con la petición Fetch:' + error.message);
    });
});