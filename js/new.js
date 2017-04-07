var fs = require('fs');
var Nightmare = require('nightmare');

var websites = getWebsites();
var results = [];
var linkNum = 0;

while(websites.length > 0){
	var current = websites.shift();
	var nightmare = Nightmare({
		gotoTimeout : 30000,
		show : false
	});
	nightmare
	  .goto(current)
	  .evaluate(function () {
	    window.fns = {
	    	traverseDOM : function(){
	    		return 'hi';
	    	}
	    }
	    return fns.traverseDOM();
	  })
	  .end()
	  .then(function (result) {
	  	if(result){
	  		results.push(result);
	  	}

	 	write(results);
	 	
	    console.log(results);
	  })
	  .catch(function (error) {
	    console.error('Search failed:', error);
	  });

	  linkNum++;
}



function write(data){
	try{
		fs.writeFile('../data/log.txt', JSON.stringify(data), function(isDone){
			console.log(isDone);
		});
	}catch(e){
		console.log("Write file error : " + e);
	}
}

function getWebsites(){
	try{
		var data = fs.readFileSync('../data/summa.csv', 'utf8');
		var arr = data.split(/\r?\n/);
		sites = arr.map(function(val, index, arr){
		    return val = "https://www." + val.split(',')[1];
		});
		return sites;
	}catch(e){
		console.log("File read error : " + e);
	}
	
}