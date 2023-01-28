$(document).ready(function(){
    console.log("ready!");

    fetch("https://raw.githubusercontent.com/jmaciassf/examQuestions/main/Salesforce-Developer-I.json") .then((response) => response.json())
    .then(function(response){

        // Random array order
        response = response.sort(function () {
            return Math.random() - 0.5;
        });

        var questionCounter = optionCounter = countQuestions = 
            countSuccess = countErrors = countQuestionsDone = 0;
        response.forEach(element => {
            console.log(element);

            if(!element.question || !element.options)
                return;
                
            countQuestions++;
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
                    <div class="buttons flex">
                        <input class="btnAnswer" type="button" value="Display answer">
                        <input class="btnNextQuestion" type="button" value="Next question">
                    </div>
                </div>
            </div>`);

            $("#items").append($item);
            var $body = $item.find(".body");

            // Title toggle - Add icon to view if the answer was correct
            var $title = $item.find(".title");
            $title.click(function(){
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

                let hasErrors = false;
                $item.find(".option").each(function(){
                    var $option = $(this);
                    var isAnswer = $option.attr("answer") == "true";
                    var isChecked = $option.find("input").is(":checked");

                    if(isAnswer && isChecked){
                        // Success
                    }
                    else if((isAnswer && !isChecked) || (!isAnswer && isChecked)){
                        // Error
                        hasErrors = true;
                        $option.addClass("error");
                    }
                });

                // Calculate percentage of success
                $item.addClass("answered");
                if(hasErrors){
                    countErrors++;
                    $item.addClass("error");
                }
                else {
                    countSuccess++;   
                    $item.addClass("success");
                }
                countQuestionsDone++;
                let percentage = Math.round(100 * countSuccess / countQuestionsDone)+"%";
                //Math.round(percentage*100)/100
                console.log(percentage);
                $(".header .success .number").html(countSuccess);
                $(".header .errors .number").html(countErrors);
                $(".header .percentage .number").html(percentage);
                
                // Disable inputs
                $item.addClass("showAnswers").find(".options input").attr("disabled", true);
            });

            // Next question
            var $next = $item.find(".btnNextQuestion");
            $next.click(function(){
                console.log("next question");

                // Collapse actual item
                $title.click();
                
                // Expand next item
                let $nextItem = $item.next();
                expandItem($nextItem);

                // Scroll en el siguiente item
                let scrollTop = $nextItem.position().top - $item.height() - 25;
                $("body").animate({ scrollTop: scrollTop }, 600, 'swing', function(){
                    
                });
                
            });
        });
        
        // Total questions
        $(".subtitle").text(countQuestions + " questions");
    }).catch(function(error) {
        console.log('Hubo un problema con la petición Fetch:' + error.message);
    });
});

// Expandir item de pregunta
function expandItem($item){
    console.log("expandItem");

    // Si está visible => no expandir
    if($item.find(".body").is(":visible"))
        return;
    
    var $title = $item.find(".title");
    $title.click();
}

/*
only select one option at time
red border when error occurs
button to show full screen cards like quizlet
count errors and success, and percentage
*/