
document.addEventListener('DOMContentLoaded', function(){//waits for everything to load
    let buttonMla = document.getElementById("MLA");
    let buttonManual = document.getElementById("manual");
    let manualEntry = document.getElementById("manualEntries");//the entry boxes

    manualEntry.style.display = "none";//default to hidden

    //buttonMla.addEventListener('click',onclick,false);//button click listener
    //registers the listeners
    buttonMla.onclick = function(){
        //alert("this still works");
        chrome.tabs.query({currentWindow: true, active: true},
            function(tabs){//callback after getting tab
                //alert("got the tab");
                chrome.tabs.sendMessage(tabs[0].id,{type :"MLA"},displayResponse);
            });

    };

    buttonManual.onclick = function(){
        //hides the manual entries.
        if(manualEntry.style.display != "none"){
            manualEntry.style.display = "none";//this may change not sure the best one yet grid or table could work
        }else{
            manualEntry.style.display = "block";//this may change not sure the best one yet grid or table could work
        }
        //creates the elements to allow manual entry
        /*TODO somehow needs to real time update what the citation looks like.
         * probably open a different connection with background.js so mulitple messages can be sent and
         * received this will be pretty cool.
         */
    };




},false);


/**
 * displays the citation
 * @param response
 */
displayResponse = function(response){
    document.getElementById("citeDisp").innerHTML = response.citation;
};