/**
 * this opens a one time connection to popup.js
 */
chrome.runtime.onMessage.addListener(async function(request,sender, sendResponse){
    //expand switch statement to allow multiple formats
    switch(request.command){
        case "MLA":
            let rawPageData = getPageData();
            const data = makeMLACitation(rawPageData);
            sendResponse({citation: data});
            break;
        default:
            alert("invalid format");
            sendResponse({citation: null});//shouldn't ever happen
    }
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
               rawPageData.todaysDate = dateFormatHTML(rawPageData.todaysDate);
               rawPageData.publishedDate = dateFormatHTML(rawPageData.publishedDate);
               rawPageData.author = parseAuthor(rawPageData.author);
                //alert("Todays date is "+ rawPageData.todaysDate);
               const citeAndData = {citation: citation, data: rawPageData};
               port.postMessage(citeAndData);
               break;
           case "change":
               //rawPageData = getPageData();//wrong will change.
               //uses the input boxes values only.
               msg.data.todaysDate = makeDateFromHTML(msg.data.todaysDate);
               //alert(msg.data.todaysDate);
               msg.data.publishedDate = makeDateFromHTML(msg.data.publishedDate);
               citation = makeMLACitation(msg.data);//not getting past here
               port.postMessage({citation: citation});//shouldn't reupdate feilds
               break;
       }
    });
});

/**
 * collects data from current tab and creates MLA citation
 * @returns {string}
 */
function makeMLACitation(rawPageData){//CHANGE TO MAKE PASS IN A JSON OF THE RAW DATA

    const formatAuthor = parseAuthor(rawPageData.author);
    const formatToday = dateFormat(rawPageData.todaysDate);
    const formatPublishedDate = dateFormat(rawPageData.publishedDate);
    alert(rawPageData.publisher);

    let MLA = "";
    if(formatAuthor != (null && undefined && ""))
        MLA += formatAuthor+". ";
    if(rawPageData.title != (null && undefined && ""))
        MLA += rawPageData.title.italics() + ". ";
    if(rawPageData.publisher != (null && undefined && ""))
        MLA += rawPageData.publisher + ",";
    if(formatPublishedDate != (null && undefined && ""))
        MLA += formatPublishedDate+ ", ";

    MLA += rawPageData.url + ".";
    copyFormatted(MLA);
    return MLA;
}

/**
 * gets unformated information of webpage.
 * @returns {{todaysDate: Date, author: string, publishedDate: Date, title: (string|string), url: string}}
 */
function getPageData(){
    const todaysDate = new Date();
    const url = window.location.href;
    const titleTag = document.title;
    const title = titleTag==(null||undefined)?"":titleTag;
    const authorTag=document.querySelector("[name=author]");
    const author=authorTag==(null||undefined)?"":authorTag.content;
    const publishedDate = new Date(document.lastModified);//don't know if this works

    return {author: author,
        title: title,
        todaysDate: todaysDate,
        publishedDate: publishedDate,
        url : url};
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
    let ret = "";
    if(formatedAuthors.length > 2){
        ret = formatedAuthors[0]+" et al";
    }else if(formatedAuthors.length == 0){
        ret = null;
    }else{
        formatedAuthors.sort();//sorts the authors.
        ret = formatedAuthors.join(" and ");
    }
    return ret;
}

/**
 * creates a dummy area of the page and then copies it to the clipboard
 * THIS CAUSES THE WEBPAGE TO FLASH Need to learn how I can fix
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
    //document.execCommand('copy')

    // [5.2]
    //for (var i = 0; i < activeSheets.length; i++) activeSheets[i].disabled = true

    // [5.3]
    document.execCommand('copy')

    // [5.4]
    //for (var i = 0; i < activeSheets.length; i++) activeSheets[i].disabled = false

    // Remove the container
    // [6]
    document.body.removeChild(container)
}
