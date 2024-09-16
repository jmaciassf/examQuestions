//window.onhashchange = getQuestions;
var ctrl = {}

$(document).ready(function(){
    console.log("ready!");
    let isStart = true;
    var $body = $("body");

    // Checkbox shuffle questions
    let $shuffle = $("#ckhShuffle");
    $shuffle.click(function(){
  /*      let setHash = $shuffle.is(":checked") ? "shuffleOn" : "shuffleOff";
        if(location.hash == "#"+setHash)
            getQuestions();
        else 
            location.hash = setHash;
*/
        localStorage.shuffle = $shuffle.is(":checked");
        getQuestions();
    });

    // Expand all
    let $expandAll = $("#ckhExpandAll");
    $expandAll.click(function(){
        console.log("Expand all click");
        var $items = $("#items .item");
        if($expandAll.is(":checked")){
            // Expand all
            $body.addClass("expandAll");
            $items.removeClass("bodyHide").addClass("bodyShow");
            localStorage.expandAll = true;
        }
        else {
            // Collapse all
            $body.removeClass("expandAll");
            $items.removeClass("bodyShow").addClass("bodyHide");
            localStorage.expandAll = false;
        }
    });
    
    if(isStart)
        getQuestions();

    // Click in any part of body
    $body.click(function(){
        if(!event || !event.target) return;
        
        var $target = $(event.target);
        if($target.parent().attr("id") == "mySidenav"
          || $target.attr("id") == "mySidenav"
          || $target.hasClass("icoMenu")){
            // Clicks aceptables
        }
        else if($target.hasClass("popup") || $target.hasClass("close")){
             // Close popup
            popup_close();
        }
        else {
            // Close menu
            closeNav();
        }
    });

    $('textarea#tiny').tinymce({ 
          height: 300,
          branding: false,
          menubar: false,
          setup:function(ed) {
            ed.on('change', function(e) {
                //console.log('the event object ', e);
                //console.log('the editor object ', ed);
                //console.log('the content ', ed.getContent());
                showPreview();
            });
        },
        plugins: [
          'advlist', 'autolink', 'lists', 'image', 'charmap', 'preview',
          'anchor', 'visualblocks', 
          'insertdatetime', 'media', 'table', 'code', 'wordcount'
        ],
        toolbar: 'bold italic ' +
          'bullist numlist outdent indent removeformat'

      });
    
    isStart = false;
});

function cleanAll(data){
    console.log("cleanAll");
    if(!data) data = {}
    
    // Clean questions
    $("body").removeClass("gridQuestions");
    $("html").scrollTop(0);
    $("#items").add($(".minimap .content")).html("");
    questionCounter = optionCounter = countQuestions = countSuccess = countErrors = countQuestionsDone = 0;
    reloadStatistics();

    if(!data.clickFavorites)
        $("body").removeClass("favorites");

    // Shuffle checkbox
    if(localStorage.shuffle == "true")
        $("#ckhShuffle").prop("checked", true);
    
    // Expand all
    var expandAll = localStorage.expandAll == "true" ? true : false;
    $("#ckhExpandAll").prop("checked", !expandAll);
    $("#ckhExpandAll").click();

    // View gridQuestions
    let gridQuestions = localStorage.gridQuestions == "true" ? true : false;
    if(gridQuestions){
        toggleQuestions();
    }
}

function reloadStatistics(){
    let percentage = 0;
    if(countQuestionsDone)
        percentage = Math.round(100 * countSuccess / countQuestionsDone)+"%";
    
    $(".header .success .number").html(countSuccess);
    $(".header .errors .number").html(countErrors);
    $(".header .percentage .number").html(percentage);
}

var questionCounter = optionCounter = countQuestions = countSuccess = countErrors = countQuestionsDone = 0;
function getQuestions(data){
    console.log("getQuestions... ");

    let title = getUrlParameter("title"), urlTitle;
    title = title ? title.toUpperCase() : "";

    let baseURL = "https://raw.githubusercontent.com/jmaciassf/examQuestions/main/data/";
    if(location.origin.includes("127.0.0.") || location.origin.includes("localhost"))
        baseURL = "http://127.0.0.1:5500/data/";

    switch(title){
        case "ADM":
            urlTitle = baseURL + "ADM.json";
            break;
            
        case "AI":
            urlTitle = baseURL + "AI.json";
            break;
            
        case "DATACLOUD":
            urlTitle = baseURL + "DataCloud.json";
            break;
        
        case "ASSOCIATE":
            urlTitle = "https://angular-2146b-default-rtdb.firebaseio.com/associate.json";
            break;

        case "JAVASCRIPT":
        case "JS":
            //urlTitle = "https://angular-2146b-default-rtdb.firebaseio.com/javascript.json";
            urlTitle = baseURL + "JS.json";
            break;

        case "PDI":
            urlTitle = baseURL + "PDI.json";
            break;
        
        case "SAA":
            urlTitle = baseURL + "AWS-SAA.json";
            break;
    }

    if(!urlTitle){
        return;
    }
    
    cleanAll(data);

    // Verificar si hay datos guardados del mismo examen, si cambia el examen => reload questions
    if(localStorage.examTitle == title && localStorage.questions){
        console.log("Session questions loading..."); 
        ctrl.questions = JSON.parse(localStorage.questions);
        setQuestions();
        return;
    }
    
    fetch(urlTitle) .then((response) => response.json())
    .then(function(response){        
        // Add internal id to each question
        response.forEach((item, index) => {
            item.id = index;
        });
        
        ctrl.questions = response;
        setQuestions();
        localStorage.questions = JSON.stringify(ctrl.questions);
        localStorage.examTitle = title;
    }).catch(function(error) {
        console.log('Hubo un problema con la petición Fetch:' + error.message);
    });

    function setQuestions(){
        console.log("setQuestions");
        let response = ctrl.questions;
        
        // Random questions order
        let isShuffle = localStorage.shuffle == "true"; //location.hash == "#shuffleOn";
        if(isShuffle){
            response = response.sort(function () {
                return Math.random() - 0.5;
            });
        }

        // Favorites
        let $body = $("body");
        if($body.hasClass("favorites")){
            response = response.filter(function (i) {
                return i.favorite;
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
                if(index == 0 && (element.answers.includes('A') || element.answers.includes(1))) answer = true;
                if(index == 1 && (element.answers.includes('B') || element.answers.includes(2))) answer = true;
                if(index == 2 && (element.answers.includes('C') || element.answers.includes(3))) answer = true;
                if(index == 3 && (element.answers.includes('D') || element.answers.includes(4))) answer = true;
                if(index == 4 && (element.answers.includes('E') || element.answers.includes(5))) answer = true;
                if(index == 5 && (element.answers.includes('F') || element.answers.includes(6))) answer = true;
                if(index == 6 && (element.answers.includes('G') || element.answers.includes(7))) answer = true;

                let text = option, explanation = "";
                if(typeof option == "object"){
                    text = option.option;
                    explanation = option.explanation;
                }
                
                arrOptions.push({ text: text, answer: answer, explanation: explanation });
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
                text = text.replace(/<apex/g, '&lt;apex').replace(/<Account/g, '&lt;Account').replace(/List</g, 'List&lt;')
                .replaceAll("    ", "\t").replaceAll("\n", "<br>")
                .replaceAll("\t", "&emsp;&emsp;").replace(/<html/g, '&lt;html').replace(/<tr/g, '&lt;tr')
                .replace(/<td/g, '&lt;td').replace(/<table/g, '&lt;table ').replace(/<\/t/g, '&lt;\/t').replace(/<\/h/g, '&lt;\/h')
                .replace(/<\/s/g, '&lt;\/s').replace(/<s/g, '&lt;s').replace(/<\/di/g, '&lt;\/di').replace(/<di/g, '&lt;di');
                return text;
            }
            
            var options = '';
            arrOptions.forEach(function(option){
                optionCounter++;
                option.text = replaceTags(option.text);
                var idOption = "option"+optionCounter;
                let explanation = option.explanation ? `<label class="explanation">${option.explanation}</label>` : "";
                options += 
                `<div class="divOption" answer="${option.answer}">
                    <label class="option" for="${idOption}" answer="${option.answer}">
                        <i class="icoStatus"></i>
                        <input type="checkbox" id="${idOption}" class="chkOption">
                        <span class="text">${option.text}</span>
                    </label>
                    ${explanation}
                </div>`;
            });

            var explanation = "";
            if(element.explanation)
                explanation = `<div class="explanation">${element.explanation}</div>`;

            questionCounter++;
            var $item = 
            $(`<div class="item" questionId="${questionCounter-1}">
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

                if($item.hasClass("bodyShow")){
                    $item.removeClass("bodyShow").addClass("bodyHide");
                }
                else {
                    $item.addClass("bodyShow").removeClass("bodyHide");
                }

                return;
                
                if(!event || !event.pointerId){
                    // Click emulated
                    $item.toggleClass("bodyShow");
                    //$body.is(":visible") ? $item.removeClass("bodyHide") : $item.addClass("bodyHide");
                    return;
                    
                    $body.toggle();
                }
                else {
                    // Click manual
                    $item.toggleClass("bodyShow");
                    //$body.is(":visible") ? $item.removeClass("bodyHide") : $item.addClass("bodyHide");
                    return;
                    
                    $body.slideToggle(function(){
                        console.log("toggle end");
                        //$body.is(":visible") ? $item.removeClass("bodyHide") : $item.addClass("bodyHide");
                    }); 
                }
            });

            // Validar la respuesta
            var $btnAnswer = $item.find(".btnAnswer");
            $btnAnswer.click(function(){
                console.log("answer click");
                
                let questionId = $item.attr("questionId");
                let jQuestion;
                if(!isNaN(questionId)){
                    jQuestion = ctrl.questions[questionId];
                    // ctrl.questions[questionId].answered = "A";
                }

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
                let $number = $(".minimap .item[questionId="+questionId+"]");
                $item.addClass("answered");
                if(hasErrors){
                    countErrors++;
                    $item.addClass("error");
                    jQuestion.answered = 'error';

                    // minimap
                    $number.addClass("error");
                }
                else {
                    countSuccess++;   
                    $item.addClass("success");
                    jQuestion.answered = 'success';
                    $number.addClass("success");
                }
                countQuestionsDone++;

                // Set statistics
                reloadStatistics();
                
                // Disable inputs
                $item.addClass("showAnswers").find(".options input").attr("disabled", true);
            
                // Save result in localStorage
                if(jQuestion){
                    // Pendiente
                    let fullQuestions = JSON.parse(localStorage.questions);
                    fullQuestions[jQuestion.id] = jQuestion;
                    localStorage.questions = JSON.stringify(fullQuestions);
                    //localStorage.questions = JSON.stringify(ctrl.questions);
                }
            });

            // Next question
            var $next = $item.find(".btnNextQuestion");
            $next.click(function(){
                console.log("next question");

                // Collapse actual item
                $title.click();
                
                // Expand next item
                let $nextItem = $item.next();
                if(!$nextItem.length) return; // Last question

                goToItem($nextItem);

                /*
                expandItem($nextItem);

                // Scroll en el siguiente item
                let scrollTop = $nextItem.position().top - $item.height() - 20;
                $("html").animate({ scrollTop: scrollTop }, 600, 'swing', function(){
                    
                });   */             
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
                console.log("reset question");
                $checkboxs.prop("checked", false).attr("disabled", false);

                let questionId = $item.attr("questionId");
                let $number = $(".minimap .item[questionId="+questionId+"]");
                
                if($item.hasClass("error")){
                    countErrors--;
                }
                else if($item.hasClass("success")) {
                    countSuccess--;
                }
                countQuestionsDone--;
                reloadStatistics();
                
                $item.removeClass("success error answered showAnswers");
                $item.$(".option").removeClass("error");
                $number.removeClass("success error");
            });

            // Map of numbers
            $(".minimap .content").append(
                '<span class="item" questionId="'+(questionCounter-1)+'" onclick="goToItem('+(questionCounter-1)+')">'
                    +questionCounter+
                '</span>'
            );
            let $number = $(".minimap .item:last");
            
            // Read previous answer
            let answerError = element.answered == "error",
                answerSuccess = element.answered == "success";
            if(answerError || answerSuccess){
                 $item.addClass("answered");
                if(answerError){
                    countErrors++;
                    $item.add($number).addClass("error");
                }
                else {
                    countSuccess++;   
                    $item.add($number).addClass("success");
                }
                countQuestionsDone++;
    
                // Set statistics
                reloadStatistics();
                
                // Disable inputs
                $item.addClass("showAnswers").find(".options input").attr("disabled", true);
            }
        });

        ctrl.questions = response;
        
        // Total questions
        $(".countQuestions").text(countQuestions + " questions");

        $('code').lineLine();

        // Set classes of expand all
        $("#ckhExpandAll").click().click();

        // Expand first question if expandAll is false
        if(!$("body").hasClass("expandAll")){
            $("#items .item:first .title").click();
        }

        $("html").scrollTop(0);
        setTimeout(function(){ $("html").scrollTop(0); }, 350);
        
        console.log("setQuestions end");
    }
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

// Go to item, scroll change
function goToItem($item){     
    if(!isNaN($item)){
        $item = $("#items .item[questionId="+$item+"]");
    }

    if(!$item.length) return;
    
    expandItem($item);

    // Scroll en el siguiente item
    let scrollTop = $item.position().top - 52;
    $("html").animate({ scrollTop: scrollTop }, 600, 'swing', function(){
        
    });   
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


function reloadQuestions(){
    console.log("reloadQuestions");

    if(confirm("Do you want to reload the questions?")){
        localStorage.questions = "";
        getQuestions();
    }
}

function resetQuestions(){
    console.log("resetQuestions");

    if(confirm("Do you want to reset the questions?")){
        if(localStorage.questions){
            ctrl.questions = JSON.parse(localStorage.questions);

            // Clean values
            ctrl.questions.forEach((q)=> delete q.answered);
            localStorage.questions = JSON.stringify(ctrl.questions);
        }
        
        getQuestions();
    }
}

function openNav() {
    if($("body").hasClass("showMenu")){
        closeNav();
        return;
    }
    
    $("body").addClass("showMenu");
}

function closeNav() {
    $("body").removeClass("showMenu");
}

function addQuestion(){
    console.log("addQuestion");

    popup_open({
        afterFn: function(){
              
        }
    });

    closeNav();
}

function popup_open(jData){
    if(!jData) jData = {}

    $(".popup").fadeIn("fast", function(){
        if(jData.afterFn)
            jData.afterFn();
    });
    $("body").addClass("popupShow");
}

function popup_close(){
    console.log("popup_close");
    $(".popup").fadeOut();
    $("body").removeClass("popupShow");
}

function showPreview(){
    console.log("showPreview");

    var myContent = tinymce.get("tiny").getContent();
    myContent = getJSONQuestionToPreview(myContent);

    $(".preview").html(myContent);
    $(".txtPreview").val(myContent);
    //copy(myContent);
    copyPreview();
}

function copyPreview(){
    let preview = $(".txtPreview").val();
    navigator.clipboard.writeText(preview);
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
function getJSONQuestionToPreview(str){
    //console.log(str);
    str = str.replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&rsquo;/g, "'"); // &ldquo;New&rdquo; and the Contact&rsquo;s
    
    // New version
    let fullResult = "";
    //str.split('<p dir="ltr">&nbsp;</p>').forEach(function(html, index){
    str.split('<ol').forEach(function(html, index){
        let question = "";

        if(html != "" && html.removeTagsTrim() != ""){
            let $ol = $("<div>"+str+"</div>").find("ol").eq(index-1); // -1 porque es otro metodo
            if($ol.find("ol").length == 0) {
                question = $ol.text() 
                .replace(/<br>/, '{{br}}').removeTagsTrim()
                .replace(/\n/, '{{br}}');
                console.log("Q: "+question);
            }
        }

        if(html != "" && question != ""){
            var options = [], arrAnswers = [];
    
            html = "<div>"+html.replace(/ start="[0-9]+">/, "")+"</div>";
            if(html.startsWith(">"))
                html = html.replace(">", "");
    
            console.log(html);
            console.log($(html));
            console.log($(html).find("ul li"));
            $(html).find("ul li").each(function(){
                var strHtml = $(this).html();
                if(!strHtml) return;
                if(strHtml.includes("<br>*")){
                    // Has help text
                    var arrSplit = $(this).html().split("<br>*");
                    if(arrSplit.length > 1){
                        var option = arrSplit[0].removeTagsTrim();
                        var explanation = arrSplit[1].removeTagsTrim();
                        var jOption = { "option": option, "explanation": explanation }
                        options.push(jOption);
                    }
                }
                else 
                    options.push({ "option": strHtml.removeTagsTrim() });
                
                // Is answer?
                if(strHtml.includes("<strong>")){
                    if(options.length == 1) arrAnswers.push("A");
                    if(options.length == 2) arrAnswers.push("B");
                    if(options.length == 3) arrAnswers.push("C");
                    if(options.length == 4) arrAnswers.push("D");
                    if(options.length == 5) arrAnswers.push("E");
                    if(options.length == 6) arrAnswers.push("F");
                }
            });
            console.log(options);
            console.log(arrAnswers);

            var result = {
                question: question,
                options: options,
                answers: arrAnswers
            }
            var strResult = JSON.stringify(result);
            strResult = strResult
                            .replace('"question"', '\n\t"question"')
                            .replace('"options":[', '\n\t"options":\n\t[')
                            .replace('"answers"', '\n\t"answers"')
                            //.replace(/","/g, '",\n\t"')
                            .replace(/",{"/g, '",\n\t{"')
                            .replace(/"},"/g, '"},\n\t"')
                            .replace(/"},{"/g, '"},\n\t{"')
                            .replace(/’/g, '\'')
                            .replace(']}', ']\n},')
                            .replace(/{{br}}/g, '<br>');
            /*
                            .replace('"question"', '\n"question"')
                            .replace('"options":[', '\n"options":\n[')
                            .replace('"answers"', '\n"answers"')
                            .replace(/"},{"/g, '"},\n{"')
                            .replace(']}', ']\n},');*/
            //copy(strResult);
            fullResult += strResult;
        }
    });

    console.log(fullResult);
    return fullResult;


    var question = str.split("<ul>")[0]
        .replace(/<br>/, '{{br}}').removeTagsTrim()
        .replace(/\n/, '{{br}}');

    var options = [], arrAnswers = [];
    $("<div>"+str+"</div>").find("ul li").each(function(){
        var strHtml = $(this).html();
        if(!strHtml) return;
        if(strHtml.includes("<br>*")){
            // Has help text
            var arrSplit = $(this).html().split("<br>*");
            if(arrSplit.length > 1){
                var option = arrSplit[0].removeTagsTrim();
                var explanation = arrSplit[1].removeTagsTrim();
                var jOption = { "option": option, "explanation": explanation }
                options.push(jOption);
            }
        }
        else 
            options.push({ "option": strHtml.removeTagsTrim() });
        
        // Is answer?
        if(strHtml.includes("<strong>")){
            if(options.length == 1) arrAnswers.push("A");
            if(options.length == 2) arrAnswers.push("B");
            if(options.length == 3) arrAnswers.push("C");
            if(options.length == 4) arrAnswers.push("D");
            if(options.length == 5) arrAnswers.push("E");
            if(options.length == 6) arrAnswers.push("F");
        }
    });
    
    var result = {
        question: question,
        options: options,
        answers: arrAnswers
    }
    var strResult = JSON.stringify(result);
    strResult = strResult
                    .replace('"question"', '\n\t"question"')
                    .replace('"options":[', '\n\t"options":\n\t[')
                    .replace('"answers"', '\n\t"answers"')
                    //.replace(/","/g, '",\n\t"')
                    .replace(/",{"/g, '",\n\t{"')
                    .replace(/"},"/g, '"},\n\t"')
                    .replace(/"},{"/g, '"},\n\t{"')
                    .replace(/’/g, '\'')
                    .replace(']}', ']\n},')
                    .replace(/{{br}}/g, '<br>');
    /*
                    .replace('"question"', '\n"question"')
                    .replace('"options":[', '\n"options":\n[')
                    .replace('"answers"', '\n"answers"')
                    .replace(/"},{"/g, '"},\n{"')
                    .replace(']}', ']\n},');*/
    //copy(strResult);
    return strResult;
}

function resetErrors(){
    console.log("resetErrors");

    if(confirm("Do you want to reset the errors?")){
        if(localStorage.questions){
            ctrl.questions = JSON.parse(localStorage.questions);

            // Clean only errors
            ctrl.questions.forEach((q)=> {
                if(q.answered == "error")
                    delete q.answered;
             });
            localStorage.questions = JSON.stringify(ctrl.questions);
        }
        
        getQuestions();
    }
}

function toggleFavorites(){
    console.log("toggleFavorites");

    let $body = $("body");
    if($body.hasClass("favorites")){
        $body.removeClass("favorites");
    }
    else {
        // Only show favorites
        $body.addClass("favorites");
    }

    getQuestions({ clickFavorites: true });
}

function toggleQuestions(){
    console.log("toggleQuestions");

    let $body = $("body");
    if($body.hasClass("gridQuestions")){
        $body.removeClass("gridQuestions");
        localStorage.gridQuestions = false;
    }
    else {
        $body.addClass("gridQuestions");
        localStorage.gridQuestions = true;
    }
}

/*

button to show full screen cards like quizlet

*/