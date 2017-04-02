//Variables declaration
var currentLink = 0;
var candidates = [];
var total = 0;
var startTime = '';
var endTime = '';
var firstLink = '';
var visitedLinks = [];

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
        if(step == 1){
            total += timeout;
            var loading = this.page.loadingProgress;
            if(total > 90000 && total < 600000){
                this.page.reload();
                this.echo("reloading");
            }else if(total >= 600000 && loading < 98){
                this.page.stop();
                this.echo("timed out");
                total = 0;
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
    websites.push("https://www."+line);
    while(line){
        line = stream.readLine().split(',')[1];
        websites.push("https://www."+line);
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
        if(keys[2] == 'sso'){
            stream.writeLine(JSON.stringify(each));
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
        total = 0;
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
                    var stack = []; var offspring; var singleResult; var arrResults = {"sso" : [], "links" : []};
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
                                        var obj = this.hasSSO(popped);
                                        if(obj['type'] == 'sso'){
                                            var i = 0;
                                            while(i < obj['value'].length){
                                                if(arrResults['sso'].indexOf(obj['value'][i]) == -1) arrResults['sso'].push(obj['value'][i]);
                                                i++;
                                            }
                                        }else if(obj['type'] == 'link'){
                                            var i = 0;
                                            while(i < obj['value'].length){
                                                arrResults['links'].push(obj['value'][i]);
                                                i++;
                                            }
                                        }
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
                    return hasKeyword;
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
                hasSSO : function(elem){
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
                        {"site" : "cloud foundry", "regex" : /cloud[\-\s]*foundry/gi, "url" : ["/uaa/oauth"]}, 
                        {"site" : "dailymotion", "regex" : /dailymotion/gi, "url" : ["https://www.dailymotion.com/oauth"]}, 
                        {"site" : "deviantart", "regex" : /deviantART/gi, "url" : ["https://www.deviantart.com/oauth2"]}, 
                        {"site" : "discogs", "regex" : /discogs/gi, "url" : ["https://api.discogs.com/oauth"]}, 
                        {"site" : "huddle", "regex" : /huddle/gi, "url" : ["https://login.huddle.net/request"]}, 
                        {"site" : "netflix", "regex" : /netflix/gi, "url" : ["https://api-user.netflix.com/oauth"]}, 
                        {"site" : "openlink data spaces", "regex" : /openlink[\-\s]*data[\-\s]*spaces/gi, "url" : ["/OAuth"]}, 
                        {"site" : "openstreetmap", "regex" : /openstreetmap/gi, "url" : ["http://www.openstreetmap.org/oauth"]}, 
                        {"site" : "opentable", "regex" : /opentable/gi, "url" : ["http://www.opentable.com/oauth"]}, 
                        {"site" : "passport", "regex" : /passport/gi, "url" : ["/dialog/authorize", "oauth2/authorize", "oauth/authorize"]},
                        {"site" : "paypal", "regex" : /paypal/gi, "url" : ["paypal.com/v1/oauth2"]}, 
                        {"site" : "plurk", "regex" : /plurk/gi, "url" : ["https://www.plurk.com/OAuth/authorize"]},
                        {"site" : "sina weibo", "regex" : /sina[\-\s]*weibo/gi, "url" : ["http://api.t.sina.com.cn/oauth/authorize"]},
                        {"site" : "stackexchange", "regex" : /stack[\-\s]*exchange/gi, "url" : ["https://stackexchange.com/oauth"]}, 
                        {"site" : "statusnet", "regex" : /statusnet/gi, "url" : ["status.net/api/oauth/authorize"]}, 
                        {"site" : "ubuntu one", "regex" : /ubuntu[\-\s]*one/gi, "url" : ["https://login.ubuntu.com/api/1.0/authentications"]},
                        {"site" : "viadeo", "regex" : /viadeo/gi, "url" : ["https://partners.viadeo.com/oauth/authorize"]},
                        {"site" : "vimeo", "regex" : /vimeo/gi, "url" : ["https://api.vimeo.com/oauth/authorize"]}, 
                        {"site" : "withings", "regex" : /withings/gi, "url" : ["https://oauth.withings.com/account/authorize"]},
                        {"site" : "xero", "regex" : /xero/gi, "url" : ["https://api.xero.com/oauth/Authorize"]},
                        {"site" : "xing", "regex" : /xing/gi, "url" : ["https://api.xing.com/v1/authorize"]}, 
                        {"site" : "goodreads", "regex" : /goodreads/gi, "url" : ["http://www.goodreads.com/oauth"]}, 
                        {"site" : "google app engine", "regex" : /google[\-\s]*app[\-\s]*engine/gi, "url" : ["https://accounts.google.com/o/oauth2/v2/auth"]},
                        {"site" : "groundspeak", "regex" : /groundspeak/gi, "url" : ["groundspeak.com/oauth"]}, 
                        {"site" : "intel cloud services", "regex" : /intel[\-\s]*cloud[\-\s]*services/gi, "url" : []}, 
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
                    var k2 = /log[\-\s]*[io]+n[\-\s]*[with]+[using]+/gi;
                    var k3 = /sign[\-\s]*[io]+n[\-\s]*[with]+[using]+/gi;
                    var k4 = /sign[\-\s]*[up]+[\-\s]*[with]+[using]+/gi;
                    var k5 = /register[\-\s]*[up]+[\-\s]*[with]+[using]+/gi;
                    var k6 = /create[\-\s]*[up]+[\-\s]*[with]+[using]+/gi;
                    var e0 = /social/gi;
                    var e1 = /subscribe/gi;
                    var e2 = /connect/gi;
                    var e3 = /like/gi;
                    var e4 = /support/gi;
                    var e5 = /recovery/gi;
                    var e6 = /forgot/gi;

                    var filtered = {"type" : 'sso', "value" : []};

                    
                    var inputstr = this.makeStringAttr(elem);
                    for(var i = 0; i < sso.length; i++){
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
                                            filtered['type'] = 'sso';
                                            if(filtered['value'].indexOf(each.site) == -1) filtered['value'].push(each.site);
                                        }
                                    }
                                }
                            }else if(openMatch != null){
                                filtered['type'] = 'sso';
                                if(filtered['value'].indexOf(each.site) == -1) filtered['value'].push(each.site);
                            }else if(inputstr.match(k2) != null || inputstr.match(k3) != null  || inputstr.match(k4) != null || 
                                inputstr.match(k5) != null || inputstr.match(k6) != null){
                                filtered['type'] = 'sso';
                                if(filtered['value'].indexOf(each.site) == -1) filtered['value'].push(each.site);
                            }else {
                                if(inputstr.match(e0) == null && inputstr.match(e1) == null  && inputstr.match(e2) == null && 
                                inputstr.match(e3) == null && inputstr.match(e4) == null && inputstr.match(e5) == null &&
                                inputstr.match(e6) == null){
                                    filtered['type'] = 'link';
                                    var extracted = this.extractLinkFrmNode(elem);
                                    if(filtered['value'].indexOf(extracted) == -1) filtered['value'].push(extracted);
                                }
                            }
                        }
                    }
                    return filtered;
                },
                //Extract link from node
                extractLinkFrmNode : function(node){
                    var href = node.getAttribute('href');
                    if(href){
                        return href;
                    }else{
                        if(node.nodeName == 'BUTTON' || node.nodeName == 'INPUT') return node.getAttribute('href') || node.getAttribute('onclick');
                        else if(node.nodeName == 'FORM') return node.getAttribute('action') || node.getAttribute('href');
                        else if(node.parentElement){
                            var parent = node.parentElement;
                            var phref = parent.getAttribute('href') || parent.getAttribute('action') || parent.getAttribute('onclick');
                            if(phref){
                                return phref;
                            }
                        }
                    }
                }
            };
        });

        //Call functions in page context
        combined = this.evaluate(function(){
            return fns.getLinks();
        });
        this.echo(JSON.stringify(combined));
        if(combined){
            for(var key in combined){
                if(key == 'links'){
                    if(combined[key].length > 0){
                        for(var k = 0; k < combined[key].length; k++){
                            var each = combined[key][k];
                            if(visitedLinks.indexOf(each) == -1){
                                if(websites.indexOf(each) == -1){
                                    casper.options.stepTimeout = 30000;
                                    websites.unshift(each);
                                }
                            }
                        }
                    }
                }else if(key == 'sso'){
                    if(combined[key].length > 0){
                        this.ssoInfo['sso'] = combined[key];
                        if(candidates.indexOf(this.ssoInfo) == -1) candidates.push(this.ssoInfo);
                    }
                }
            }
        }
        this.echo(JSON.stringify(candidates));
        this.echo(JSON.stringify(websites));
    });
}


//Check if links are present and run them
function check(){
    if(websites.length > 0){
        this.clear();
        firstLink = websites.shift();
        visitedLinks.push(firstLink);
        this.echo('--- Link ' + currentLink + ' ---');
        this.ssoInfo = {'url' : firstLink, 'page' : ''};
        start.call(this, firstLink);
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
    // websites = ["https://www.google.com"]
    startTime = Date.now();
});

readWebsitesFromCSV();

casper.run(check);