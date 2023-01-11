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
                if(index == 4 && element.answers.includes('E')) answer = true;
                if(index == 5 && element.answers.includes('F')) answer = true;
                
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

            var addHTML = 
            $(`<div class="item">
                <div class="question">${element.question}</div>
                <div class="options">${options}</div>
                <div class="buttons flex"><input class="btnAnswer" type="button" value="Display answer"></div>
            </div>`);

            $("#items").append(addHTML);

            // Validar la respuesta
            var $btnAnswer = $(addHTML).find(".btnAnswer");
            $btnAnswer.click(function(){
                console.log("answer click");
                var $item = $(this).parents(".item");

                $item.find(".option").each(function(){
                    var $option = $(this);
                    var isAnswer = $option.attr("answer") == "true";
                    var isChecked = $option.find("input").is(":checked");

                    //var isCorrect = isAnswer && isChecked ? $option.addClass("correct") : $option.addClass("error");
                });

                $item.addClass("showAnswers");
            });
        });

    }).catch(function(error) {
    console.log('Hubo un problema con la petición Fetch:' + error.message);
    });
});