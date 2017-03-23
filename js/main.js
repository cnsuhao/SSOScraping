//Required modules
var fs = require('fs');
var casper = require('casper').create({
    verbose : true
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
function addLinks(link) {
    this.then(function() {
        var found = this.evaluate(searchLinks);
        this.echo(found.length + " links found on " + link);
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
        start.call(this, websites[currentLink]);
        addLinks.call(this, websites[currentLink]);
        currentLink++;
        this.run(check);
    } else {
        this.echo(websites);
        this.echo("All done.");
        this.exit();
    }
}
/* ---------------------------------------- Helper functions end ------------------------------------------------------------  */

/* ---------------------------------------------------- Search functions start ----------------------------------------------- */ 
function search() {
    var filter, map;
    filter = Array.prototype.filter;
    map = Array.prototype.map;
    return map.call(filter.call(document.querySelectorAll("a"), function(a) {
        return (/^http:\/\/.*/i).test(a.getAttribute("href"));
    }), function(a) {
        return a.getAttribute("href");
    });
}

/* ---------------------------------------------------- Search functions end ----------------------------------------------- */

/* ------------------------------------Function calls and program start here ------------------------------------------------  */
casper.start().then(function() {
    this.echo("Starting");
});

casper.run(check);