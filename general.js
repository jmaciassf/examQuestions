
String.prototype.removeTags = function(json) {
    var str = this;
    if(json) {
        if(json.exclude_br) {        	
            str = str.replace(/<div><br><\/div>/g, "@@br@@");
            str = str.replace(/<br*>/g, "@@br@@");
            str = str.replace(/<div>/g, "@@br@@");
            str = str.replace(/<\/p>/g, "@@br@@");
            str = str.replace(/<\/table>/g, "@@br@@");
            str = str.replace(/<\/h[0-9]>/g, "@@br@@");
            str = str.replace(/<[^>]*>/g, "");
            str = str.replace(/@@br@@/g, "<br>");            
        }

        if(json.toLabel) {
            str = str.replace(/<br*>/g, "\u000A");
        }

        return str;
    }

    str = str.replace(/<br*>/g, " ");
    return str.replace(/<[^>]*>/g, "");
};
String.prototype.removeTagsTrim = function(json) {
    return this.removeTags(json).replace(/&nbsp;/g, '').trim();
};

$.fn.$ = function(selector) {
    return $(this).find(selector);
}

//window.onbeforeunload = function (){ return ""; };