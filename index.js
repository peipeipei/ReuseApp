/**
Sample JSON File

{"products":
	{
        "brand": "string",
        "isElectronic": boolean,
        "isClothing": boolean,
        "isBook": boolean,
        "isOther": boolean
        "description": "string",
        "condition": "string", 
        "price": "string",
        "location": "string",
        "detail": "string",
        "poster": "username",
        "isForSale": boolean to indicate if item is for sale(true) or wanted(false), 
      },
}
**/



"use strict";

var etag=null;

$(document).ready(function(){
    //to make things easier to debug 
    reload();

    $('#forNewItem').click(function(){
        if ($('.newItemForm').hasClass("notVisibleForm")){
            $('.newItemForm').removeClass("notVisibleForm");
            $('.newItemForm').addClass("visibleForm");
        }
        else if ($('.newItemForm').hasClass("visibleForm")){
            $('.newItemForm').removeClass("visibleForm");
            $('.newItemForm').addClass("notVisibleForm");
        }
        
    });
});


function podURL() {
	// temporary hack until we have a nice way for users to select their pod
	//return "http://"+document.getElementById("username").value+".fakepods.com";
	return document.getElementById("podurl").value
}


function reload(type) {
	//alert(type);
	if(typeof(type)==='undefined') 
		{	
			type = "all";
		}
	var request = new XMLHttpRequest();
	// just fetch everything, for now, since queries don't work yet
	request.open("GET", podURL()+"/_nearby", true);
	if (etag !== null) {
		request.setRequestHeader("Wait-For-None-Match", etag);
		console.log('doing a long poll', etag);
	} else {
		console.log('initial fetch, not a long poll');
	}
	request.onreadystatechange = function() {
		if (request.readyState==4 && request.status==200) {
			console.log("handling response type "+type);
            //folowing line throws an error
    		handleResponse(request.responseText, type);
    	}
 	}
	request.send();
}


function handleResponse(responseText, type){
    console.log('got response');
	var responseJSON = JSON.parse(responseText);
	etag = responseJSON._etag;
	var all = responseJSON._members;
    console.log(all);
	var messages = [];
	console.log('got response');
	for (var i=0; i<all.length; i++) {
		var item = all[i];
		// consider the 'text' property to be the essential one
		var now = Date.now();
		if ('CrossCloudReuseList' in item) {
            console.log(item);
			item.timeDate = new Date(Number(item.time))
			if (now - item.timeDate < 86400000) {
				if (type == "all"){
					messages.push(item);}
				else if (item.type == type){
					messages.push(item);
					}
			}
		}
	}
    messages.sort(function(a,b){return Number(a.time)-Number(b.time)});
	
	var out = document.getElementById("products")
	while(out.firstChild) { out.removeChild(out.firstChild) }
	for (i=0; i<messages.length; i++) {
		var message = messages[i];
        
        var itemType;
        if (message.isBooks){
            itemType = "Books";   
        }
        else if (message.isElectronics){
            itemType = "Electronics"; 
        }
        else if (message.isFurniture){
            itemType = "Furniture";  
        }
        else if (message.isClothing){
            itemType = "Clothing";  
        }
        else{
            itemType = "Other"; 
        }

		if (Number(message.time) > 0) {
			
			var div = document.createElement("div");
			message.timeDate = new Date(Number(message.time))
			var date = message.timeDate.toLocaleString();
			
			var line = "<h2>"+message.brand+"</h2>";
			line += "<p><b>Price: </b>"+message.price+"</b>";
			line += "<p><b>Condition: </b>"+message.condition+"</b>";
            line += "<p><b>Brand: </b>"+message.description+"</b>";
			line += "<p><b>Type: </b>"+itemType+"</b>";
            line += "<p><b>Location: </b>"+message.location+"</b>";

			var link = document.createElement("a");

			div.innerHTML = line;
			link.href=message._id;
			link.appendChild(document.createTextNode("item"));
			div.appendChild(link);
			
			out.appendChild(div);
			
		}
	}
    	document.getElementById("items").style.visibility = "visible"
	// wait for 100ms then reload when there's new data.  If data
	// comes faster than that, we don't really want it.
	setTimeout(reload, 50);
    
}

function makeJSON(brand, type, condition, description, price, location){
    var file = {};
    file["CrossCloudReuseList"] = true;
    file["brand"] = brand;
    file["condition"] = condition;
    file["description"] = description;
    file["price"] = price;
    file["location"] = location;
    
    var isElectronics = (type == "electronics");
    var isClothing = (type == "clothing");
    var isBooks = (type == "books");
    var isFurniture = (type == "furniture");
    var isOther = (type == "other");
    
    file["isElectronics"] = isElectronics;
    file["isClothing"] = (type == "clothing");
    file["isBooks"] = (type == "books");
    file["isFurniture"] = (type == "furniture");
    file["isOther"] = (type == "other");
    file["time"] = Date.now();
    
    return file;
}

function newmsg() {
    var brand = document.getElementById("brand").value;
	var type = document.getElementById("type").value
    var condition = document.getElementById("condition").value;
    var description = document.getElementById("description").value;
    var price = document.getElementById("price").value;
    var location = document.getElementById("location").value;
    
    
    if (description&&condition&&price) {
     	var request = new XMLHttpRequest();
	    request.open("POST", podURL());
    	request.onreadystatechange = function() {
            if (request.readyState==4 && request.status==201) {
				// why does this always print null, even though it's not?
				// console.log("Location:", request.getResponseHeader("Location"));
     		}
		}
		request.setRequestHeader("Content-type", "application/json");
        
        var thisJSON = makeJSON(brand, type, condition, description, price, location);
        var content = JSON.stringify(thisJSON);
		request.send(content);
	} 
    
    
    document.getElementById("brand").value = "";
	document.getElementById("type").value = "";
	document.getElementById("description").value = "";
	document.getElementById("condition").value = "";
	document.getElementById("price").value = "";
    document.getElementById("location").value = "";
    
    
}






