$(function(){//waits for everything to load
    let buttonMla = $('#MLA');
    let buttonManual = $('#manual');
    let manualEntry = document.getElementById("manualEntries");//the entry boxes

    manualEntry.style.display = "none";//default to hidden

    buttonMla.on("click",function(){
            //alert("this still works");
            chrome.tabs.query({currentWindow: true, active: true},
                function(tabs){//callback after getting tab
                    //alert("got the tab");
                    chrome.tabs.sendMessage(tabs[0].id,{type :"MLA"},displayResponse);
                });

        });
    //event not trigger anymore.
     buttonManual.on("click", function() {
        alert("event fired");
        //hides the manual entries.
        if (manualEntry.style.display != "none") {
            alert("getting rid of manual stuff");
            manualEntry.style.display = "none";
        } else {
            alert("displaying the manual stuff now");
            manualEntry.style.display = "block";//this may change not sure the best one yet grid or table could work
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

});


/**
 * displays the citation
 * @param response
 */
function displayResponse(response){
    document.getElementById("citeDisp").innerHTML = response.Citation;
    //displays the data if it exsists.
    if(response.hasOwnProperty("data")){
        //note: publisher isn't in here since I don't know how to find it from the webpage.
        document.getElementById("titleInput").value = response.data.Title;
        document.getElementById("authorInput").value = response.data.Author;
        //these 2 don't work
        document.getElementById("todaysDateInput").value = response.data.TodaysDate;
        document.getElementById("publishedDateInput").value = response.data.PublishedDate;
    }
};

