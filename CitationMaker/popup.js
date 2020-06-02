$(function(){//waits for everything to load
    let buttonMla = $("#MLA");
    let buttonManual = $("#manual");
    let manualEntry = $("#manualEntries");
    let Inputs = $(".manualInput");//I guess im not using this maybe delete?

    //default to hidden
    manualEntry.css("display", "none");

    buttonMla.on("click",function(){
            chrome.tabs.query({currentWindow: true, active: true},
                function(tabs){//callback after getting tab
                    chrome.tabs.sendMessage(tabs[0].id,{command :"MLA"},displayResponse);
                });

        });

     buttonManual.on("click", function() {
        //hides the manual entries.
        if (manualEntry.css("display") != "none") {
            manualEntry.css("display", "none");
        } else {
            //this may change not sure the best one yet grid or table could work
            manualEntry.css("display", "block");
            $("#publisherInput").val("");
        }
        //opens the connection to the background.
        chrome.tabs.query({currentWindow: true, active: true},
            function (tabs) {//callback after getting tab
                let port = chrome.tabs.connect(tabs[0].id);
                port.postMessage({command: "init"});//message to make default citation
                port.onMessage.addListener(function (msg) {
                    displayResponse(msg);
                });
            });

    });
    //whenever a input is changed the citation is updated.
    manualEntry.on("input", function(){
        chrome.tabs.query({currentWindow: true, active: true},
            function (tabs) {//callback after getting tab
                let port = chrome.tabs.connect(tabs[0].id);
                //know that they are empty strings at this point.
                port.postMessage({command: "change",
                    data : {
                        todaysDate : $("#todaysDateInput").val(),
                        author : getManualData("#authorInput"),
                        title : getManualData("#titleInput"),
                        publisher : getManualData("#publisherInput"),
                        publishedDate : $("#publishedDateInput").val(),
                        url : getManualData("#urlInput")
                    }
                });
               // alert("message sent");
                port.onMessage.addListener(function (msg) {
                    displayResponse(msg);
                });
            });
    })

});

/**
 * returns value of input tag or null if empty
 * JSON has trouble with empty strings so this is a workaround
 * @param selector
 * @returns {*}
 */
function getManualData(selector){
   return $(selector).val() == "" ? null : $(selector).val();
}

/**
 * displays the citation
 * @param response
 */
function displayResponse(response){

    $("#citeDisp").html(response.citation);
    //displays the data if it exists.
    if(response.hasOwnProperty("data")){
        //note: publisher isn't in here since I don't know how to find it from the webpage.
        $("#titleInput").val(response.data.title);
        $("#authorInput").val(response.data.author);
        $("#todaysDateInput").val(response.data.todaysDate);
        $("#publishedDateInput").val(response.data.publishedDate);
        $("#urlInput").val(response.data.url);
    }
}

