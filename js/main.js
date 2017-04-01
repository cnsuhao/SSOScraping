//Required modules
var fs = require('fs');
var casper = require('casper').create({
    verbose : true,
    logLevel : 'info',
    stepTimeout : 180000,
    pageSettings : {
        userAgent : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
        ignoreSslErrors: true
    },
    onStepTimeout : function(timeout, step){
        // if(step == 1){
        //     total += timeout;
        //     loading = this.page.loadingProgress;
        //     if(loading < 95 && timeout > ){
        //         this.echo(total);
        //         this.clear();
        //         this.page.stop();
        //         this.echo("timed out");
        //     }
        // }
    }
});

//Variables declared
var currentLink = 0;
var candidates = [];
var total = 0;

/* --------------------------------------------- Helper functions start --------------------------------------------------- */
//Function to read links from CSV file
function readWebsitesFromCSV(){
    websites = [];
    //Script starts
    stream = fs.open('../data/top-1000.csv','r');
    line = stream.readLine().split(',')[1];
    websites.push({
        "link" : "https://www."+line,
        "type" : "login",
        "action" : "click"
    });

    while(line){
        line = stream.readLine().split(',')[1];
        websites.push({
            "link" : "https://www."+line,
            "type" : "login",
            "action" : "click"
        });
    }
    stream.flush();
    stream.close();
}

function writeToFile(candidates){
    stream = fs.open('../data/log.txt', 'w');
    
    for(var i=0; i<candidates.length;i++){
        var each = candidates[i];
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

/* --------------------------------------------- Helper functions end --------------------------------------------------- */
/* --------------------------------------------- Main functions start --------------------------------------------------- */
// Get the links, and add them to the links array
function findClickLinks(link) {
    var found, finalLink;
    type = this.type;
    this.then(function(){
        //Define functions in the page's context
        this.evaluate(function(){
            window.clickfns = {
                searchForClickCandidates : function(type){
                    var stack = []; var children; var current; var results = [];
                    stack.push(document.body)
                    
                    while(stack.length > 0){
                        current = stack.pop();
                        if(current != null){
                            children = current.children;
                            if(children){
                                var arrayChildren = [].slice.call(children);
                                arrayChildren.forEach(function(currVal, arr, index){
                                    stack.unshift(currVal);
                                });
                            }
                            if(!(current.attributes == null || current.nodeName == "SCRIPT" ||
                                current.nodeName == "EMBED" )){
                                yno = this.filterNode(current);
                                if(yno){
                                    result = this.processSingleNode(current, type);
                                    if(result){
                                        var href = this.extractLink(current);
                                        if(results.indexOf(href) == -1 && href != null) results.push(href);
                                    }
                                }
                            }
                        }
                    }
                    return results;
                },
                processSingleNode : function(node, type){
                    var strToCheck; var result;
                    strToCheck = this.makeAttrString(node);
                    result = this.checkForKeywords(strToCheck, type);
                    return result;
                },
                filterNode : function(current){
                    var bool = true;
                    if (current.nodeName != "A" && current.nodeName != "DIV" && current.nodeName != "IMG" &&
                        current.nodeName != "SPAN" && current.nodeName != "INPUT" &&
                        current.nodeName != "BUTTON") bool = false;
                    if (current.nodeName == "INPUT") {
                        if (current.type != "button" && current.type != "img" &&
                            current.type != "submit") bool = false;
                    }
                    if (current.nodeName == "A") {
                        if (current.href.toLowerCase().indexOf('mailto:') == 0) bool = false;
                    }
                    return bool;
                },
                makeAttrString : function(node){
                    var str = '';
                    var attribs = node.attributes;
                    for(var i=0; i < attribs.length; i++){
                        str += attribs[i].name + "=" + attribs[i].value + ";"
                    }
                    return str;
                },
                checkForKeywords : function(inputstr, type){
                    var k2 = /log[\-\s]*[io]+n/gi;
                    var k3 = /sign[\-\s]*[io]+n/gi;
                    var k4 = /sign[\-\s]*up+/gi;
                    var k5 = /create[\-\s]*account+/gi;
                    var k6 = /register/gi;

                    if(type == 'login'){
                        if(inputstr.match(k2) != null || inputstr.match(k3) != null){
                            return true;
                        }
                    }else if(type == 'signup'){
                        if(inputstr.match(k4) != null || inputstr.match(k5) != null || inputstr.match(k6) != null){
                            return true;
                        }
                    }
                    return false;
                },
                extractLink : function(node){
                    var parent = node.parentElement;
                    var val = node.getAttribute('href') || node.getAttribute('onclick') || node.getAttribute('action');
                    if(val){
                        return val;
                    }else{
                        if(parent){
                            var parentVal = node.getAttribute('href') || node.getAttribute('onclick') || node.getAttribute('action');
                            if(parentVal) return parentVal;
                        }
                    }
                    return null;
                }
            };
        });
        if(type == 'login'){
            found = this.evaluate(function(){
                return clickfns.searchForClickCandidates('login');
            });
        }else if(type == 'signup'){
            found = this.evaluate(function(){
                return clickfns.searchForClickCandidates('signup');
            });
        }
        this.echo(found + "links found on " + link);
        if(link.indexOf('/signup') != -1){
            link = link.replace('/signup', '');
        }else if(link.indexOf('/login') != -1){
            link = link.replace('/login', '');
        }
        if(found.length > 0){
            for(key in found){
                if(found[key] != '#'){
                    val = found[key];
                    if(val[0] == "/" && val[1] == "/"){
                        val = "https:" + val;
                    }else if(val[0] == "/"){
                         val = link + val;
                    }else if(val.indexOf('()') != -1){
                        if(type == 'login'){
                            val = link + '/login';
                        }else{
                            val = link + '/signup';
                        }
                    }
                    finalLink = val;
                    this.echo("finalLink-----" + finalLink);
                    if(finalLink)break;
                }
            }
            if(type == 'login'){
                websites.unshift({
                    "link" : finalLink,
                    "type" : "signup",
                    "action" : "click"
                });
                websites.unshift({
                    "link" : finalLink,
                    "type" : "login",
                    "action" : "sso"
                });
            }else if(type == 'signup'){
                websites.unshift({
                    "link" : finalLink,
                    "type" : "signup",
                    "action" : "sso"
                });
            }
        }else{
            if(type == 'login'){
                websites.unshift({
                    "link" : link + '/login',
                    "type" : "signup",
                    "action" : "click"
                });
                websites.unshift({
                    "link" : link + '/login',
                    "type" : "login",
                    "action" : "sso"
                });
            }else if(type == 'signup'){
                websites.unshift({
                    "link" : link + '/signup',
                    "type" : "signup",
                    "action" : "sso"
                });
            }
        }
    });
}

function findSSOLinks(link){
    var sme;
    type = this.type;
    ssoInfo = this.ssoInfo;
    this.then(function(){
        //First define the functions in the page's context
        this.evaluate(function(){
            window.ssofns = {
                searchForSSOCandidates : function(){
                    var stack = []; var children; var current; var results = [];
                    stack.push(document.body)
                    
                    while(stack.length > 0){
                        current = stack.pop();
                        if(current != null){
                            children = current.children;
                            if(children){
                                var arrayChildren = [].slice.call(children);
                                arrayChildren.forEach(function(currVal, arr, index){
                                    stack.unshift(currVal);
                                });
                            }
                            if(!(current.attributes == null || current.nodeName == "SCRIPT" ||
                                current.nodeName == "EMBED" )){
                                yno = this.filterNode(current);
                                if(yno){
                                    result = this.processSingleNode(current);
                                    if(result){
                                        if(results.indexOf(result) == -1) results.push(result);
                                    }
                                }
                            }
                        }
                    }
                    return results;
                },
                processSingleNode : function(node){
                    var strToCheck; var result;
                    strToCheck = this.makeAttrString(node);
                    result = this.checkForKeywords(strToCheck);
                    return result;
                },
                filterNode : function(current){
                    var bool = true;
                    if (current.nodeName != "A" && current.nodeName != "DIV" && current.nodeName != "IMG" &&
                        current.nodeName != "SPAN" && current.nodeName != "INPUT" &&
                        current.nodeName != "BUTTON") bool = false;
                    if (current.nodeName == "INPUT") {
                        if (current.type != "button" && current.type != "img" &&
                            current.type != "submit") bool = false;
                    }
                    if (current.nodeName == "A") {
                        if (current.href.toLowerCase().indexOf('mailto:') == 0) bool = false;
                    }
                    return bool;
                },
                makeAttrString : function(node){
                    var str = '';
                    var attribs = node.attributes;
                    for(var i=0; i < attribs.length; i++){
                        str += attribs[i].name + "=" + attribs[i].value + ";"
                    }
                    return str;
                },
                checkForKeywords : function(inputstr){
                    var sso = [{"site" : "google", "regex" : /google/gi, "url" : ["https://accounts.google.com/o/oauth2/auth"]}, 
                        {"site" : "yahoo", "regex" : /yahoo/gi, "url" : ["https://api.login.yahoo.com/oauth2/request_auth"]}, 
                        {"site" : "500px", "regex" : /500px/gi, "url": ["https://api.500px.com/v1/oauth"]}, 
                        {"site" : "aol", "regex" : /aol/gi, "url" :["https://api.screenname.aol.com/auth"]}, 
                        {"site" : "twitter", "regex" : /twitter/gi, "url" : ["https://api.twitter.com/oauth"]}, 
                        {"site" : "vk", "regex" : /vk/gi, "url" : ["https://oauth.vk.com/authorize"]}, 
                        {"site" : "yammer", "regex" : /yammer/gi, "url" : ["https://www.yammer.com/oauth2/authorize"]}, 
                        {"site" : "yandex", "regex" : /yandex/gi, "url" : ["https://oauth.yandex.com/authorize"]},
                        {"site" : "zendesk", "regex" : /zendesk/gi, "url" : [".zendesk.com/oauth/authorizations/new"]}, 
                        {"site" : "amazon", "regex" : /amazon/gi, "url" : ["http://g-ecx.images-amazon.com/images/G/01/lwa/btnLWA", "https://images-na.ssl-images-amazon.com/images/G/01/lwa/btnLWA"]},
                        {"site" : "flickr", "regex" : /flickr/gi, "url" : ["https://www.flickr.com/services/oauth"]}, 
                        {"site" : "bitbucket", "regex" : /bitbucket/gi, "url" : ["https://bitbucket.org/site/oauth2", "https://bitbucket.org/api/1.0/oauth"]}, 
                        {"site" : "bitly", "regex" : /bitly/gi, "url" : ["https://bitly.com/oauth"]}, 
                        {"site" : "cloud foundry", "regex" : /cloud[\-\S]foundry/gi, "url" : ["/uaa/oauth"]}, 
                        {"site" : "dailymotion", "regex" : /dailymotion/gi, "url" : ["https://www.dailymotion.com/oauth"]}, 
                        {"site" : "deviantart", "regex" : /deviantART/gi, "url" : ["https://www.deviantart.com/oauth2"]}, 
                        {"site" : "discogs", "regex" : /discogs/gi, "url" : ["https://api.discogs.com/oauth"]}, 
                        {"site" : "huddle", "regex" : /huddle/gi, "url" : ["https://login.huddle.net/request"]}, 
                        {"site" : "netflix", "regex" : /netflix/gi, "url" : ["https://api-user.netflix.com/oauth"]}, 
                        {"site" : "openlink data spaces", "regex" : /openlink[\-\S]data[\-\S]spaces/gi, "url" : ["/OAuth"]}, 
                        {"site" : "openstreetmap", "regex" : /openstreetmap/gi, "url" : ["http://www.openstreetmap.org/oauth"]}, 
                        {"site" : "opentable", "regex" : /opentable/gi, "url" : ["http://www.opentable.com/oauth"]}, 
                        {"site" : "passport", "regex" : /passport/gi, "url" : ["/dialog/authorize", "oauth2/authorize", "oauth/authorize"]},
                        {"site" : "paypal", "regex" : /paypal/gi, "url" : ["paypal.com/v1/oauth2"]}, 
                        {"site" : "plurk", "regex" : /plurk/gi, "url" : ["https://www.plurk.com/OAuth/authorize"]},
                        {"site" : "sina weibo", "regex" : /sina[\-\S]weibo/gi, "url" : ["http://api.t.sina.com.cn/oauth/authorize"]},
                        {"site" : "stackexchange", "regex" : /stack[\-\S]exchange/gi, "url" : ["https://stackexchange.com/oauth"]}, 
                        {"site" : "statusnet", "regex" : /statusnet/gi, "url" : ["status.net/api/oauth/authorize"]}, 
                        {"site" : "ubuntu one", "regex" : /ubuntu[\-\S]one/gi, "url" : ["https://login.ubuntu.com/api/1.0/authentications"]},
                        {"site" : "viadeo", "regex" : /viadeo/gi, "url" : ["https://partners.viadeo.com/oauth/authorize"]},
                        {"site" : "vimeo", "regex" : /vimeo/gi, "url" : ["https://api.vimeo.com/oauth/authorize"]}, 
                        {"site" : "withings", "regex" : /withings/gi, "url" : ["https://oauth.withings.com/account/authorize"]},
                        {"site" : "xero", "regex" : /xero/gi, "url" : ["https://api.xero.com/oauth/Authorize"]},
                        {"site" : "xing", "regex" : /xing/gi, "url" : ["https://api.xing.com/v1/authorize"]}, 
                        {"site" : "goodreads", "regex" : /goodreads/gi, "url" : ["http://www.goodreads.com/oauth"]}, 
                        {"site" : "google app engine", "regex" : /google[\-\S]app[\-\S]engine/gi, "url" : ["https://accounts.google.com/o/oauth2/v2/auth"]},
                        {"site" : "groundspeak", "regex" : /groundspeak/gi, "url" : ["groundspeak.com/oauth"]}, 
                        {"site" : "intel cloud services", "regex" : /intel[\-\S]cloud[\-\S]services/gi, "url" : []}, 
                        {"site" : "jive", "regex" : /jive/gi, "url" : ["jiveon.com/oauth2"]}, 
                        {"site" : "linkedin", "regex" : /linkedin/gi, "url" : ["https://www.linkedin.com/oauth/v2/authorization"]}, 
                        {"site" : "trello", "regex" : /trello/gi, "url" : ["https://trello.com/1/OAuthAuthorizeToken", "https://trello.com/1/authorize"]}, 
                        {"site" : "tumblr", "regex" : /tumblr/gi, "url" : ["https://www.tumblr.com/oauth/authorize"]}, 
                        {"site" : "microsoft", "regex" : /microsoft/gi, "url" : ["https://login.live.com/oauth20"]},
                        {"site" : "mixi", "regex" : /mixi/gi, "url" : ["api.mixi-platform.com/OAuth"]}, 
                        {"site" : "myspace", "regex" : /myspace/gi, "url" : ["api.myspace.com/authorize"]}, 
                        {"site" : "etsy", "regex" : /etsy/gi, "url" : ["https://www.etsy.com/oauth"]}, 
                        {"site" : "evernote", "regex" : /evernote/gi, "url" : ["https://sandbox.evernote.com/OAuth.action"]},  
                        {"site" : "yelp", "regex" : /yelp/gi, "url" : ["https://api.yelp.com/oauth2"]},  
                        {"site" : "facebook", "regex" : /facebook/gi, "url" : ["fb-login-button", "https://www.facebook.com/v2.0/dialog/oauth",  "https://www.facebook.com/v2.3/dialog/oauth"]},
                        {"site" : "dropbox", "regex" : /dropbox/gi, "url" : ["https://www.dropbox.com/1/oauth2/authorize", "https://www.dropbox.com/1/oauth/authorize"]}, 
                        {"site" : "twitch", "regex" : /twitch/gi, "url" : ["https://api.twitch.tv/kraken/oauth2/authorize"]},
                        {"site" : "stripe", "regex" : /stripe/gi, "url" : ["https://connect.stripe.com/oauth/authorize"]},
                        {"site" : "basecamp", "regex" : /basecamp/gi, "url" : ["https://launchpad.37signals.com/authorization/new"]},
                        {"site" : "box", "regex" : /box/gi, "url" : ["https://account.box.com/api/oauth2/authorize"]},
                        {"site" : "formstack", "regex" : /formstack/gi, "url" : ["https://www.formstack.com/api/v2/oauth2/authorize"]},
                        {"site" : "github", "regex" : /github/gi, "url" : ["https://github.com/login/oauth/authorize"]},
                        {"site" : "reddit", "regex" : /reddit/gi, "url" : ["https://www.reddit.com/api/v1/authorize"]},
                        {"site" : "instagram", "regex" : /instagram/gi, "url" : ["https://api.instagram.com/oauth/authorize"]},
                        {"site" : "foursquare", "regex" : /foursquare/gi, "url" : ["https://foursquare.com/oauth2/authorize"]},
                        {"site" : "fitbit", "regex" : /fitbit/gi, "url" : ["https://www.fitbit.com/oauth2/authorize"]},
                        {"site" : "imgur", "regex" : /imgur/gi, "url" : ["https://api.imgur.com/oauth2/authorize"]},
                        {"site" : "salesforce", "regex" : /salesforce/gi, "url" : ["https://login.salesforce.com/services/oauth2/authorize"]},
                        {"site" : "strava", "regex" : /strava/gi, "url" : ["https://www.strava.com/oauth/authorize"]},
                        {"site" : "battle.net", "regex" : /battle.net/gi, "url" : ["https://us.battle.net/oauth/authorize"]}]
                    var k0 = /oauth/gi;
                    var k1 = /openid/gi
                    var k2 = /log[\-\S]?[io]n/gi;
                    var k3 = /sign[\-\S]?[io]n/gi;
                    var k4 = /sign[\-\S]?up/gi;
                    var k5 = /with[\-\S]/gi;
                    var e0 = /social/gi;
                    var e1 = /subscribe/gi;
                    var e2 = /connect/gi;
                    var e3 = /like/gi;

                    for(var i=0; i < sso.length; i++){
                        var each = sso[i];
                        var siteMatch = inputstr.match(each.regex);
                        if(siteMatch != null){
                            var authMatch = inputstr.match(k0);
                            var openMatch = inputstr.match(k1);
                            if(authMatch != null){
                                var urlList = each.url;
                                var urlLen = urlList.length;
                                if(urlLen > 0){
                                    for(var j=0; j < urlLen; j++){
                                        var urlMatch = inputstr.match(urlList[j]);
                                        if(urlMatch != null){
                                            return each.site;
                                        }
                                    }
                                }
                            }else if(openMatch != null){
                                return each.site;
                            }else{
                                if(inputstr.match(k2) != null || inputstr.match(k3) != null  || inputstr.match(k4) != null ){
                                    return each.site;
                                }
                            }
                        }
                    }
                }
                
            };
        });
        var ssoResult;
        ssoResult = this.evaluate(function(){
            return ssofns.searchForSSOCandidates();
        });
        this.echo(ssoResult);
        if(type == 'login'){
            ssoInfo['login'] = ssoResult;
        }else if(type == 'signup'){
            ssoInfo['signup'] = ssoResult;
        }
        if(candidates.indexOf(ssoInfo) == -1){
            candidates.push(ssoInfo);
        }
    });
}


// Just opens the page and prints the title
function start(link) {
    this.start(link, function() {
        this.echo('Page title: ' + this.getTitle());
        // this.ssoInfo['page'] = this.getTitle();
    });
}

// As long as it has a next link, and is under the maximum limit, will keep running
function check() {
    if (websites.length > 0) {
        current = websites.shift();
        this.echo('--- Link ' + currentLink + ' ---');
        this.type = current.type;
        this.ssoInfo = {'url' : current.link};
        action = current.action;
        start.call(this, current.link);
        if(action == 'click'){
            findClickLinks.call(this, current.link);
        }else if(action == 'sso'){
            findSSOLinks.call(this, current.link);
        }
        currentLink++;
        this.run(check);
    } else {
        writeToFile(candidates);
        this.echo("All done.");
        this.exit();
    }
}
/* ---------------------------------------- Main functions end ------------------------------------------------------------  */

/* ------------------------------------Function calls and program start here ------------------------------------------------  */
casper.start().then(function() {
    this.echo("Starting");
    // websites = [{"link" : "https://www.basecamp.com", "type" : "login", "action" : "click"}]
});
readWebsitesFromCSV();

casper.run(check);