//Required modules
var casper = require('casper').create({
	verbose : true
});
var utils = require('utils');
var fs = require('fs');


//Variables decalaration
results = [];

/*
* Functions to read from SSO sites
*/
//Read websites from CSV
function readWebsitesFromCSV(){
	websites = [];

	//Script starts
	stream = fs.open('../data/summa.csv','r');
	line = stream.readLine().split(',')[1];
	websites.push("https://www."+line);

	while(line){
		line = stream.readLine().split(',')[1];
		websites.push("https://www."+line);
	}
	stream.flush();
	stream.close();
	return websites;
}

/*
* Functions to process webpage for SSO
*/
function search(){
	//Variables declaration
	candidateSSO = {"loginSSO" : [], "signupSSO" : []};
	var links = document.querySelectorAll('a');
    return Array.prototype.map.call(links, function(e) {
        return e.getAttribute('href');
    });
}



/*
*	Function calls and program start here
*/

//Start casper instance


//Call function to read from websites
websites = readWebsitesFromCSV();

casper.start().each(websites, function(self, site){
	this.echo(site);
	self.thenOpen(site, function(){
		this.echo(self.getTitle());
		title = this.evaluate(search());
	});
	self.then(function(){
		this.echo(title);
	});
});
// casper.then(function(){
// 	while(websites.length > 0){
// 		current = websites.pop();
// 		this.echo(current);
// 		candidate = search("https://www."+current);
// 		if(candidate != null || candidate != {} || !(candidate['loginSSO'].length == 0 && candidate['signupSSO'].length ==0)){
// 			results.push(candidate);
// 		}
// 	}
// });
casper.run(function(){
	this.echo("hi");
	this.exit();
});


