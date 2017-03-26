//Required modules
var fs = require('fs');
var casper = require('casper').create({
    verbose : true,
    logLevel : 'error'
});

//Variables
var currentLink = 0;


/* --------------------------------------------- Helper functions start --------------------------------------------------- */
//Function to read links from CSV file
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

// Get the links, and add them to the links array
function findClickLinks(link) {
    var found, stringified;
    type = this.type;
    this.then(function(){
        if(type == 'login'){
            found = this.evaluate(searchForClickCandidates, 'login');
        }else if(type == 'signup'){
            found = this.evaluate(searchForClickCandidates, 'signup');
        }
        this.echo(found + "links found on " + link);
        if(found.length > 0){
            for(key in found){
                if(found[key].indexOf("/") == 0){
                    found[key] = link + found[key];
                    if(type == 'login'){
                        this.loginLink = found[key];
                    }else if(type == 'signup'){
                        this.signupLink = found[key];
                    }
                    
                }
                if(type == 'login'){
                    this.loginLink = found[key];
                }else if(type == 'signup'){
                    this.signupLink = found[key];
                }
            }
        }else{
            this.loginLink = '';
        }
    });
}

function findSSOLinks(link){
    this.thenOpen(link, function(){
        this.echo(this.getTitle());
    });
}


// Just opens the page and prints the title
function start(link) {
    this.start(link, function() {
        this.echo('Page title: ' + this.getTitle());
    });
}

// As long as it has a next link, and is under the maximum limit, will keep running
function check() {
    if (websites[currentLink]) {
        this.echo('--- Link ' + currentLink + ' ---');
        this.loginLink = '';
        this.signupLink = '';
        this.candidates = {};
        this.type = 'login';
        start.call(this, websites[currentLink]);
        findClickLinks.call(this, websites[currentLink]);
        findSSOLinks.call(this, this.loginLink);
        this.type = 'signup';
        findClickLinks.call(this, this.loginLink);
        findSSOLinks.call(this, this.signupLink);
        currentLink++;
        this.run(check);
    } else {
        this.echo("All done.");
        this.exit();
    }
}
/* ---------------------------------------- Helper functions end ------------------------------------------------------------  */

/* ---------------------------------------------------- Search functions start ----------------------------------------------- */ 
function searchForClickCandidates(type){
    var foundElems, map;
    foundElems = document.querySelectorAll("a, button, span, div, img");
    filter = Array.prototype.filter;
    map = Array.prototype.map;
    return map.call(filter.call(foundElems, function(elem){
        if(type == 'login'){
            return ((/log[\s-_]?[io]n/gi).test(elem));
        }else if(type == 'signup'){
            return (/sign[\s-_]?up/gi).test(elem) || (/create[\s-_]?account/gi).test(elem);
        }
    }), function(elem){
        return elem.getAttribute('href');
    });
}
function searchForSSO() {
    var stack = [];
    stack.push(document.body);
    while(stack.length > 0){
        var current = stack.pop();
        if(current != null){
            var children = current.children;
            if(children){
                var arrayChildren = [].slice.call(children);
                arrayChildren.forEach(function(currVal, index, array){
                    stack.unshift(currVal);
                });
            }
            if(!(current.attributes == null || current.nodeName == "SCRIPT" ||
                current.nodeName == "EMBED" )){
                    processSingleNode(current);
            }
        }
    }  
}

function processSingleNode(){

}

/* ---------------------------------------------------- Search functions end ----------------------------------------------- */

/* ------------------------------------Function calls and program start here ------------------------------------------------  */
casper.start().then(function() {
    this.echo("Starting");
});
readWebsitesFromCSV();

casper.run(check);