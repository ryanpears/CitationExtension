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
                port.postMessage({command: "change",
                    data : {
                        author : $("#authorInput").val(),
                        title : $("#titleInput").val(),
                        publisher : $("#publisherInput").val(),
                        publishedDate : $("#publishedDateInput").val(),
                        todaysDate : $("#todaysDateInput").val(),
                        url : $("#urlInput").val()
                    }
                });
                port.onMessage.addListener(function (msg) {
                    displayResponse(msg);
                });
            });
    })

});

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

