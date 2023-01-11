$(document).ready(function(){
    console.log("ready!");

    fetch("https://raw.githubusercontent.com/jmaciassf/examQuestions/main/Salesforce-Developer-I.json") .then((response) => response.json())
    .then(function(response){
        // Total questions
        $(".subtitle").text(response.length + " questions");

        // Random array order
        response = response.sort(function () {
            return Math.random() - 0.5;
        });

        var questionCounter = optionCounter = 0;
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

            questionCounter++;
            var $item = 
            $(`<div class="item">
                <div class="title">Question ${questionCounter}</div>
                <div class="body">
                    <div class="question">${element.question}</div>
                    <div class="options">${options}</div>
                    <div class="buttons flex"><input class="btnAnswer" type="button" value="Display answer"></div>
                </div>
            </div>`);

            $("#items").append($item);
            var $body = $item.find(".body");

            // Title toggle - Add icon to view if the answer was correct
            $item.find(".title").click(function(){
                console.log("title click");
                $body.slideToggle(function(){
                    console.log("toggle end");
                    $body.is(":visible") ? $item.removeClass("bodyHide") : $item.addClass("bodyHide");
                });
            });

            // Validar la respuesta
            var $btnAnswer = $item.find(".btnAnswer");
            $btnAnswer.click(function(){
                console.log("answer click");

                $item.find(".option").each(function(){
                    var $option = $(this);
                    var isAnswer = $option.attr("answer") == "true";
                    var isChecked = $option.find("input").is(":checked");
                });

                $item.addClass("showAnswers").find("input").attr("disabled", true);
            });
        });
    }).catch(function(error) {
        console.log('Hubo un problema con la petición Fetch:' + error.message);
    });
});