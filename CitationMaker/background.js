/**
 * this opens a one time connection to popup.js
 */
chrome.runtime.onMessage.addListener(async function(request,sender, sendResponse){
    //can add switchstatement for the request to support mulitple formats
    const data = makeMLACitation();
    sendResponse({citation: data});
    return true; //tells chrome this is async
});

/**
 * this opens up a long lived connection to popup.js
 */
chrome.extension.onConnect.addListener(function(port){
    //alert("in background.js connected");
    port.onMessage.addListener(function(msg){
       switch(msg.command){
           case "init":
               port.postMessage("making inital");
               break;
           case "change":
               port.postMessage("changed shit");
               break;
       }
    });
});

/**
 * collects data from current tab and creates MLA citation
 * @returns {string}
 */
makeMLACitation = function(){
    let todaysDate = new Date();
    let url = window.location.href;
    let titleTag = document.title;
    let title = titleTag==(null||undefined)?"":titleTag;
    let authorTag=document.querySelector("[name=author]");
    let author=authorTag==(null||undefined)?"":authorTag.content;
    let publishedDate = new Date(document.lastModified);

    const formatAuthor = parseAuthor(author);
    const formatToday = dateFormat(todaysDate);
    const formatPublishedDate = dateFormat(publishedDate);

    let MLA = "";
    if(formatAuthor != "")
        MLA += formatAuthor+". ";
    if(title != (null||undefined||""))
        MLA += title.italics() + ". ";
    if(formatPublishedDate != (null||undefined||""))
        MLA += formatPublishedDate+ ", "

    MLA += url + ".";
    copyFormatted(MLA);//hopefully this works
    return MLA;
}

/**
 * formats the date to a dd mon. yyyy format
 * @param date
 * @returns {*}
 */
dateFormat = function(date){
    if(date == (null||undefined))
        return "";
    let month, year, day, formatedDate;
    const months = ["Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."];

    month = months[date.getMonth()];
    day = date.getDay();
    year = date.getFullYear();
    formatedDate = day+ " " + month + " " + year;
    return formatedDate;

}

/**
 * parses and puts the authors into MLA format
 * @param author
 * @returns {*}
 */
parseAuthor = function(author){
    if(author == undefined || author == null)//sometimes there is an author tag but no content.
        return "";
    const HTMLTag = /(<([^>]+)>)/ig;
    author = author.replace(HTMLTag, "");//delete any stray HTML tags
    const byStr = /.*[^\Wby\W]*\Wby\W|^([^by\W]*by\W)/i;
    author = author.replace(byStr,"");//replaces anything before by with the empty string.
    const authors = author.split(/and\s|,/);// splits names
    //alert(authors);
    let formatedAuthors = [];
    let lastName, name, formatedName;
    for(let i =0; i < authors.length; i++){
        name = authors[i].trim().split(/\s/);
        if(name.length >1){//in case something weird ends up inside
            lastName = name.pop();
            if(name.length > 1){//maybe check for titles like dr here.
                formatedName = name[0] +" "+ name[1].charAt(0)+". ";
                formatedName = lastName +", "+formatedName;
                formatedAuthors.push(formatedName);
            }else{
                formatedName = lastName + ", " + name[0];
                formatedAuthors.push(formatedName);
            }
        }
    }
    var ret;
    if(formatedAuthors.length > 2){
        ret = formatedAuthors[0]+" et al";
    }else{
        formatedAuthors.sort();//sorts the authors.
        ret = formatedAuthors.join(" and ");
    }
    return ret;
}

/**
 * creates a dummy area of the page and then copies it to the clipboard
 * found this on https://stackoverflow.com/questions/34191780/javascript-copy-string-to-clipboard-as-text-html
 * @param html
 */
function copyFormatted (html) {
    // Create container for the HTML
    // [1]
    var container = document.createElement('div')
    container.innerHTML = html

    // Hide element
    // [2]
    container.style.position = 'fixed'
    container.style.pointerEvents = 'none'
    container.style.opacity = 0

    // Detect all style sheets of the page
    var activeSheets = Array.prototype.slice.call(document.styleSheets)
        .filter(function (sheet) {
            return !sheet.disabled
        })

    // Mount the container to the DOM to make `contentWindow` available
    // [3]
    document.body.appendChild(container)

    // Copy to clipboard
    // [4]
    window.getSelection().removeAllRanges()

    var range = document.createRange()
    range.selectNode(container)
    window.getSelection().addRange(range)

    // [5.1]
    document.execCommand('copy')

    // [5.2]
    for (var i = 0; i < activeSheets.length; i++) activeSheets[i].disabled = true

    // [5.3]
    document.execCommand('copy')

    // [5.4]
    for (var i = 0; i < activeSheets.length; i++) activeSheets[i].disabled = false

    // Remove the container
    // [6]
    document.body.removeChild(container)
}