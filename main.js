window.onhashchange = getQuestions;

$(document).ready(function(){
    console.log("ready!");
    let isStart = true;

    // Checkbox shuffle questions
    let $shuffle = $("#ckhShuffle");
    $shuffle.click(function(){
        let setHash = $shuffle.is(":checked") ? "shuffleOn" : "shuffleOff";
        if(location.hash == "#"+setHash)
            getQuestions();
        else 
            location.hash = setHash;
    });
    
    if(isStart && location.hash == "#shuffleOff")
        getQuestions();
    else 
        $shuffle.click();

    let $expandAll = $("#ckhExpandAll");
    $expandAll.click(function(){
        var $items = $("#items .item");
        if($expandAll.is(":checked")){
            $items.removeClass("bodyHide").find(".body").show();
        }
        else {
            $items.addClass("bodyHide").find(".body").hide();
        }
    });
    
    isStart = false;
});

function cleanAll(){
    console.log("cleanAll");
    
    // Clean questions
    $("#items").html("");
    questionCounter = optionCounter = countQuestions = countSuccess = countErrors = countQuestionsDone = 0;
    reloadStatistics();
    $("#ckhExpandAll").prop("checked", true);
}

function reloadStatistics(){
    let percentage = 0;
    if(countQuestionsDone)
        percentage = Math.round(100 * countSuccess / countQuestionsDone)+"%";
    
    console.log(percentage);
    $(".header .success .number").html(countSuccess);
    $(".header .errors .number").html(countErrors);
    $(".header .percentage .number").html(percentage);
}

var questionCounter = optionCounter = countQuestions = countSuccess = countErrors = countQuestionsDone = 0;
function getQuestions(){
    console.log("getQuestions... ");

    let title = getUrlParameter("title"), urlTitle;
    switch(title){
        case "SAA":
            urlTitle = "https://raw.githubusercontent.com/jmaciassf/examQuestions/main/data/AWS-SAA.json";
            break;

        case "PDI":
            urlTitle = "https://raw.githubusercontent.com/jmaciassf/examQuestions/main/Salesforce-Developer-I.json";
            break;
    }

    if(!urlTitle){
        return;
    }
    
    cleanAll();
    
    fetch(urlTitle) .then((response) => response.json())
    .then(function(response){

        // Random questions order
        let isShuffle = location.hash == "#shuffleOn";
        if(isShuffle){
            response = response.sort(function () {
                return Math.random() - 0.5;
            });
        }

        response.forEach(element => {
            //console.log(element);

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

            element.question = replaceTags(element.question);
            function replaceTags(text){
                if(text.includes('static ListRecommendation')){
                    var x = 1;
                }
                text = text.replace(/<apex/g, '&lt;apex').replace(/<Account/g, '&lt;Account').replace(/List</g, 'List&lt;');
                return text;
            }
            
            var options = '';
            arrOptions.forEach(function(option){
                optionCounter++;
                option.text = replaceTags(option.text);
                var idOption = "option"+optionCounter;
                options += 
                `<label class="option" for="${idOption}" answer="${option.answer}">
                    <input type="checkbox" id="${idOption}"><span class="text">${option.text}</span>
                </label>`;
            });

            var explanation = "";
            if(element.explanation)
                explanation = `<div class="explanation">${element.explanation}</div>`;

            questionCounter++;
            var $item = 
            $(`<div class="item">
                <div class="title">Question ${questionCounter}</div>
                <div class="body">
                    <div class="question">${element.question}</div>
                    <div class="options">${options}</div>
                    ${explanation}
                    <div class="buttons flex">
                        <input class="btnAnswer" type="button" value="Display answer">
                        <span class="btnReload"></span>
                        <input class="btnNextQuestion" type="button" value="Next question">
                    </div>
                </div>
            </div>`);

            $("#items").append($item);
            var $body = $item.find(".body");
            let $options = $item.find(".option");

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
                $options.each(function(){
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

                // Set statistics
                reloadStatistics();
                
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
                let scrollTop = $nextItem.position().top - $item.height() - 20;
                $("body").animate({ scrollTop: scrollTop }, 600, 'swing', function(){
                    
                });                
            });

            // Click en el checkbox de la respuesta
            var $checkboxs = $item.find("input[type=checkbox]");
            $checkboxs.click(function(){
                console.log("click option");

                // Validar la cantidad de respuestas
                if($(this).is(":checked") && element.answers.length < $item.find("input[type=checkbox]:checked").length){
                    // Si ya se llegó al límite, quitar el check cuando son multiples respuestas
                    if(element.answers.length > 1){
                        // Quitar el check
                        $(this).prop("checked", false);
                    }
                    else {
                        // Si solo es una respuesta => quitar las otras opciones y habilitar la actual
                        $checkboxs.prop("checked", false);
                        $(this).prop("checked", true);

                    }
                }
            });

            $item.find(".btnReload").click(function(){
                console.log("reload");
                $checkboxs.prop("checked", false).attr("disabled", false);

                if($item.hasClass("error")){
                    countErrors--;
                }
                else if($item.hasClass("success")) {
                    countSuccess--;
                }
                countQuestionsDone--;
                reloadStatistics();
                
                $item.removeClass("success error answered showAnswers");
            })
        });
        
        // Total questions
        $(".countQuestions").text(countQuestions + " questions");
    }).catch(function(error) {
        console.log('Hubo un problema con la petición Fetch:' + error.message);
    });
}

// Expandir item de pregunta
function expandItem($item){
    console.log("expandItem");

    // Si está visible => no expandir
    if($item.find(".body").is(":visible"))
        return;
    
    var $title = $item.find(".title");
    $title.click();
}

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'), sParameterName, i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

// json format questions getJSONQuestion(`x`)
function getJSONQuestion(str){
    var arrStr = str.split('\n');
    if(!arrStr.length){
        return "No hay información disponible";
    }
    
    var question = arrStr[0];

    var options = [];
    for(var i = 1; i < arrStr.length; i++){
        if(arrStr[i])
            options.push(arrStr[i]);
    }

    var result = {
        question: question,
        options: options,
        answers: [""]
    }
    var strResult = JSON.stringify(result);
    strResult = strResult
                    .replace('"question"', '\n\t"question"')
                    .replace('"options":[', '\n\t"options":\n\t[')
                    .replace('"answers"', '\n\t"answers"')
                    .replace(/","/g, '",\n\t"')
                    .replace(']}', ']\n},');
    copy(strResult);
    //return strResult;
}

window.onbeforeunload = function (){ return ""; };
/*
button to show full screen cards like quizlet
*/