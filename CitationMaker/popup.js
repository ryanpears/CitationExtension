$(function(){//waits for everything to load
    let buttonMla = $("#MLA");
    let buttonManual = $("#manual");
    //let manualEntry = document.getElementById("manualEntries");//the entry boxes
    let manualEntry = $("#manualEntries");
    let Inputs = $(".manualInput");

    //default to hidden
    manualEntry.css("display", "none");

    buttonMla.on("click",function(){
            //alert("this still works");
            chrome.tabs.query({currentWindow: true, active: true},
                function(tabs){//callback after getting tab
                    //alert("got the tab");
                    chrome.tabs.sendMessage(tabs[0].id,{type :"MLA"},displayResponse);
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

        /*TODO somehow needs to real time update what the citation looks like.
         * probably open a different connection with background.js so mulitple messages can be sent and
         * received this will be pretty cool.
         */
        /*PLAN:
         *first message sends request to background.js to read the page we get a json of elements to populate
         * the input boxes with. then a second message is sent that creates the "default" citation. on changes
         * to the input boxes (probably need another eventlistner) the same message with be sent so the citation
         * coninuosly updates.
         */
        //opens the connection to the background.
        chrome.tabs.query({currentWindow: true, active: true},
            function (tabs) {//callback after getting tab
                let port = chrome.tabs.connect(tabs[0].id);
                port.postMessage({command: "init"});
                port.onMessage.addListener(function (msg) {
                    displayResponse(msg);
                });
            });

    });

    manualEntry.on("input", function(){
        //const id = event.target.id;//don't think I need ID i think I can just send a json of everything
        chrome.tabs.query({currentWindow: true, active: true},
            function (tabs) {//callback after getting tab
                let port = chrome.tabs.connect(tabs[0].id);

                port.postMessage({command: "change",
                    data : {
                    Author : $("#authorInput").val(),
                    Title : $("#titleInput").val(),
                    Publisher : $("#publisherInput").val(),
                    PublishedDate : $("#publishedDateInput").val(),
                    TodaysDate : $("#todaysDateInput").val()
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
    alert("citation is "+ response.Citation);
    $("#citeDisp").html(response.Citation);
    //displays the data if it exsists.
    if(response.hasOwnProperty("data")){
        //note: publisher isn't in here since I don't know how to find it from the webpage.
        $("#titleInput").val(response.data.Title);
        $("#authorInput").val(response.data.Author);
        //these 2 don't work
        $("#todaysDateInput").val(response.data.TodaysDate);
        $("#publishedDateInput").val(response.data.PublishedDate);
    }
};

