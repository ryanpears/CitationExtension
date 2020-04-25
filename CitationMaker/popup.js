
document.addEventListener('DOMContentLoaded', function(){//waits for everything to load
    let buttonMla = document.getElementById("MLA");
   buttonMla.addEventListener('click',onclick,false);//button click listener

   onclick = function(){
       chrome.tabs.query({currentWindow: true, active: true},
           function(tabs){//callback after getting tab
           //alert("got the tab");
               chrome.tabs.sendMessage(tabs[0].id,{type :"MLA"},displayResponse);
           });

   }
},false);

/**
 * displays the citation
 * @param response
 */
displayResponse = function(response){
    document.getElementById("citeDisp").innerHTML = response.citation;
}