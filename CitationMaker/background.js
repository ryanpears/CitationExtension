/**
 * this opens a one time connection to popup.js
 */
chrome.runtime.onMessage.addListener(async function(request,sender, sendResponse){
    //can add switchstatement for the request to support mulitple formats
    let rawPageData = getPageData();
    const data = makeMLACitation(rawPageData);
    sendResponse({Citation: data});
    return true; //tells chrome this is async
});

/**
 * this opens up a long lived connection to popup.js
 */
chrome.extension.onConnect.addListener(function(port){
    //alert("in background.js connected");
    port.onMessage.addListener(function(msg){
        let rawPageData;
        let citation;
       switch(msg.command){
           case "init":
               rawPageData = getPageData();
               citation = makeMLACitation(rawPageData);
               //formats the date to html usible format
               rawPageData.TodaysDate = dateFormatHTML(rawPageData.TodaysDate);
               rawPageData.PublishedDate = dateFormatHTML(rawPageData.PublishedDate);
               rawPageData.Author = parseAuthor(rawPageData.Author);
               const citeAndData = {Citation: citation, data: rawPageData};
               port.postMessage(citeAndData);
               break;
           case "change":
               //rawPageData = getPageData();//wrong will change.
               //uses the input boxes values only.
               msg.data.TodaysDate = makeDateFromHTML(msg.data.TodaysDate);
               msg.data.PublishedDate = makeDateFromHTML(msg.data.PublishedDate);
               citation = makeMLACitation(msg.data);//not getting past here
               port.postMessage({Citation: citation});//shouldn't reupdate feilds
               break;
       }
    });
});

/**
 * collects data from current tab and creates MLA citation
 * @returns {string}
 */
function makeMLACitation(rawPageData){//CHANGE TO MAKE PASS IN A JSON OF THE RAW DATA

    const formatAuthor = parseAuthor(rawPageData.Author);
    const formatToday = dateFormat(rawPageData.TodaysDate);
    const formatPublishedDate = dateFormat(rawPageData.PublishedDate);

    let MLA = "";
    if(formatAuthor != "")
        MLA += formatAuthor+". ";
    if(rawPageData.Title != (null && undefined && ""))
        MLA += rawPageData.Title.italics() + ". ";
    if(rawPageData.Publisher != (null && undefined &&""))
        MLA += rawPageData.Publisher + ",";
    if(formatPublishedDate != (null && undefined && ""))
        MLA += formatPublishedDate+ ", "

    MLA += rawPageData.Url + ".";
    copyFormatted(MLA);
    return MLA;
}

/**
 * gets the data from the webpage unfomated.
 * @returns {{TodaysDate: *, Author: *, Title: (string|string), PublishedDate: *, Url: string}}
 */
function getPageData(){
    const todaysDate = new Date();
    const url = window.location.href;
    const titleTag = document.title;
    const title = titleTag==(null||undefined)?"":titleTag;
    const authorTag=document.querySelector("[name=author]");
    const author=authorTag==(null||undefined)?"":authorTag.content;
    const publishedDate = new Date(document.lastModified);//don't know if this works

    return {Author: author,
        Title: title,
        TodaysDate: todaysDate,
        PublishedDate: publishedDate,
        Url : url};
}

/**
 * parses yyyy-MM-dd into javascript date
 * @param date
 */
function makeDateFromHTML(date){
    let split = date.split("-");
    return new Date(split[0], split[1]-1, split[2]);
}

/**
 * formats the date to a dd mon. yyyy format
 * @param date
 * @returns {*}
 */
function dateFormat(date){
    if(date == (null||undefined))
        return "";
    let month, year, day, formatedDate;
    const months = ["Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."];

    month = months[date.getMonth()];
    day = date.getDate();
    year = date.getFullYear();
    formatedDate = [day, month, year].join(" ");
    return formatedDate;

}

/**
 * formates date in yyyy-mm-dd for html display
 * @param date
 * @returns {string}
 */
function dateFormatHTML(date){
    if(date == (null||undefined))
        return "";
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}


/**
 * parses and puts the authors into MLA format
 * @param author
 * @returns {*}
 */
function parseAuthor(author){
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