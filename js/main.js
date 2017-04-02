//Variables declaration
var currentLink = 0;
var candidates = [];
var total = 0;
var startTime = '';
var endTime = '';

//Required modules
var fs = require('fs');
var casper = require('casper').create({
    verbose : true,
    logLevel : 'info',
    stepTimeout : 30000,
    pageSettings : {
        loadPlugins : false,
        webSecurityEnabled : false
    },
    onStepTimeout : function(timeout, step){
        total += timeout;
        if(step == 1){
            if(total > 90000 && total < 300000){
                this.page.reload();
                this.echo("reloading");
            }else if(total >= 300000){
                this.page.stop();
                this.echo("timed out");
            }
        }
    }
});


//Function to read links from CSV file
function readWebsitesFromCSV(){
    websites = [];
    //Script starts
    stream = fs.open('../data/summa.csv','r');
    line = stream.readLine().split(',')[1];
    websites.push({
        "link" : "https://www."+line
    });
    while(line){
        line = stream.readLine().split(',')[1];
        websites.push({
            "link" : "https://www."+line
        });
    }
    stream.flush();
    stream.close();
}

//Write SSO candidates to file
function logSSO(cArray){
    stream = fs.open('../data/log.txt', 'w');
    for(var i = 0; i < cArray.length; i++){
        var each = cArray[i];
        var keys = Object.keys(each);
        if(keys[1] == 'login'){
            if(each['login'].length > 0){
                stream.writeLine(JSON.stringify(each));
            }
        }else if(keys[1] == 'signup'){
            if(each['signup'].length > 0){
                stream.writeLine(JSON.stringify(each));
            }
        }
    }
    stream.flush();
    stream.close();
}

//Start Url
function start(link){
    this.start(link, function(){
        this.ssoInfo['page'] = this.getTitle();
        this.echo("Page : " + this.getTitle());
    });
}
//Find links on page related to login, sign up and sso and carry out appropriate actions
function findLinks(){
    this.then(function(){
        var links = []; var ssos = []; var combined = {};

        //Define functions in this page's context
        this.evaluate(function(){
            window.fns = {
                getLinks : function(){
                    var stack = []; var offspring; var singleResult; var arrResults = [];
                    stack.push(document.body);
                    while(stack.length > 0){
                        var popped = stack.pop();
                        if(popped != null){
                            offspring = popped.children;
                            if(offspring){
                                var arr = [].slice.call(offspring);
                                arr.forEach(function(currVal, arr, index){
                                    stack.unshift(currVal);
                                });
                            }
                            if(!(popped.attributes == null || popped.nodeName == 'SCRIPT' || popped.nodeName == 'EMBED')){
                                var bool = this.filterNode(popped);
                                if(bool){
                                    singleResult = this.processNodeForLinks(popped);
                                    if(singleResult){
                                        if(arrResults.indexOf(popped) == -1) arrResults.push(popped);
                                    }
                                }
                            }
                        }
                    }
                    return arrResults;
                },
                filterNode : function(current){
                    var valid = true;
                    if (current.nodeName != "A" && current.nodeName != "DIV" && current.nodeName != "IMG" &&
                        current.nodeName != "SPAN" && current.nodeName != "INPUT" &&
                        current.nodeName != "BUTTON") valid = false;
                    if (current.nodeName == "INPUT") {
                        if (current.type != "button" && current.type != "img" &&
                            current.type != "submit") valid = false;
                    }
                    if (current.nodeName == "A") {
                        if (current.href.toLowerCase().indexOf('mailto:') == 0) valid = false;
                    }
                    return valid;
                },
                processNodeForLinks : function(node){
                    var attrStr; var hasKeyword;
                    attrStr = this.makeStringAttr(node);
                    hasKeyword = this.hasLink(attrStr);
                },
                makeStringAttr : function(node){
                    var str = '';
                    var attribs = node.attributes;
                    for(var i=0; i < attribs.length; i++){
                        str += attribs[i].name + "=" + attribs[i].value + ";"
                    }
                    return str;
                },
                hasLink : function(strInp){
                    var k1 = /log[\-\s]*[io]+n/gi;
                    var k2 = /sign[\-\s]*[io]+n/gi;
                    var k3 = /sign[\-\s]*up+/gi;
                    var k4 = /create[\-\s]*account+/gi;
                    var k5 = /register/gi;

                    if(strInp.match(k1) != null || strInp.match(k2) != null || strInp.match(k3) != null || 
                        strInp.match(k4) != null || strInp.match(k5) != null){
                        return true;
                    }
                    return false;
                },
                hasSSO : function(elems){
                    
                }
            };
        });

        //Call functions in page context
        combined = this.evaluate(function(){
            return fns.hasSSO(fns.getLinks());
        });



    });
}

//Check if links are present and run them
function check(){
    if(websites.length > 0){
        var current = websites.shift();
        this.echo('--- Link ' + currentLink + ' ---');
        this.ssoInfo = {'url' : current.link, 'page' : ''};
        start.call(this, current.link);
        findLinks.call(this);
        currentLink++;
        this.run(check);
    }else{
        logSSO(candidates);
        this.echo("All done.");
        endTime = Date.now();
        timeTaken = endTime - startTime + "ms";
        this.echo("Executed in:" + timeTaken);
        this.exit();
    }
}

casper.start().then(function(){
    this.echo("Starting process");
});

readWebsitesFromCSV();

casper.run(check);