"use strict";
$(document).ready(function(){
    
});

function makeMsgJSON(to, msg){
    var file = {};
    //file["from"] = from;
    file["to"] = to;
    file["msg"] = msg;
    
    file["time"] = Date.now();
    file["reusePrivMessage"] = true; //to mark out that this is a private message for the reuse app
    
    return file;
}


$(function(){
    $("#error").html("");  // clear the "Missing Javascript" error message

    var pod = crosscloud.connect();
    var myMessages = [];

    var sendMsg = function () {
        //var from = ;
        var to = document.getElementById("to").value;
        var msg = document.getElementById("msg").value;
        
    
        var thisJSON = makeMsgJSON(to, msg);
        console.log(thisJSON);
        //var content = JSON.stringify(thisJSON);
                
        myMessages.push(thisJSON);
        pod.push(thisJSON);

        //document.getElementById("from").value = "";
        document.getElementById("to").value = "";
        document.getElementById("msg").value = "";
        //var userId = pod.loggedInURL;
       // alert(to + " and " + userId);
       
    };

    $("#submit").click(sendMsg);

    

    //var show = 12;

    /**************************************************************
    *We only want to display messages that we have permission to see.
    *
    *************************************************************/
    var displayMessages = function (messages) {
        
        messages.sort(function(a,b){return a.when<b.when?1:(a.when===b.when?0:-1)});
        //var count = 0;
        var out = document.getElementById("reusePrivMessage");
        out.innerHTML=" ";
        var i;
        //alert(messages[1].description);
        for (i=0; i<messages.length; i++) {
            var message = messages[i];
            
            //alert(message._id);
            
            
        if (Number(message.time) > 0) {
            var to = message.to;
            //alert(pod.getUserId() + " to: " +to);
            //if(to.equals(pod.getUserId())){
                var div = document.createElement("div");
                div.className = "messageInfo";
                message.timeDate = new Date(Number(message.time))
                var date = message.timeDate.toLocaleString();
                
                var line = "";
                line += "<div>From: "+message._owner+"</div>";
                //line += "<div>To: "+message.to+"</div>";
                line += "<div>Message: "+message.msg+"</div>";
                line += "<div>Time: " + date+"</div>";

                var link = document.createElement("a");

                div.innerHTML = line;
                link.href=message._id;
                link.appendChild(document.createTextNode("item"));
                div.appendChild(link);
                
                out.appendChild(div);
            //}
        }
    }
        /*if (count > show) {
            $("#out").append("<p><i>("+(count-show)+" more not shown)</i></p>");
        }*/
    };

    pod.onLogin(function () {
        //$("#products").html("waiting for data...");
        pod.onLogout(function () {
            $("#products").html("<i>not connected</i>");
        });

        pod.query()
            .filter( { reusePrivMessage:true, to: pod.getUserId() } )
            .onAllResults(displayMessages)
            .start();
    });

  
    function clearList(){
        var out = document.getElementById("reusePrivMessage");
            out.innerHTML="";
    }

});

