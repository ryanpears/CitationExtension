chrome.runtime.onMessage.addListener(async function(request,sender, sendResponse){
    //can add switchstatement for the request to support mulitple formats
    const data = makeMLACitation();
    sendResponse({citation: data});
    return true; //tells chrome this is async
});

/**
 * collects data from current tab and creates MLA citation
 * @returns {string}
 */
makeMLACitation = function(){
    let todaysDate = new Date();
    let url = window.location.href;
    let title = document.title;
    let author_tag=document.querySelector("[name=author]");
    let author=author_tag==(null||undefined)?"":author_tag.content;
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