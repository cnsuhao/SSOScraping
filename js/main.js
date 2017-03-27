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
    return websites;
}

// Get the links, and add them to the links array
function findClickLinks(link) {
    var found, finalLink;
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
                }
                finalLink = found[key];
                if(finalLink)break;
            }
            if(type == 'login'){
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
        }
    });
}

function findSSOLinks(link){
    this.then(function(){
        type = this.type;
        var found, finalLink;
        found = this.evaluate(searchForSSO, type)
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
    if (websites.length > 0) {
        current = websites.shift();
        this.echo('--- Link ' + currentLink + ' ---');
        this.loginLink = '';
        this.signupLink = '';
        this.candidates = {};
        this.type = current.type;
        action = current.action;
        start.call(this, current.link);
        if(action == 'click'){
            findClickLinks.call(this, current.link);
        }else if(action == 'sso'){
            findSSOLinks.call(this, current.link)
        }
        currentLink++;
        this.echo(websites.length);
        this.run(check);
    } else {
        this.echo(websites.length);
        this.echo("All done.");
        this.exit();
    }
}
/* ---------------------------------------- Helper functions end ------------------------------------------------------------  */

/* ---------------------------------------------------- Search functions start ----------------------------------------------- */ 
function searchForClickCandidates(type){
    var regexes = [/log[\s-_]?[io]n/gi, /sign[\s-_]?[io]n/gi, /sign[\s-_]?up/gi, /create[\s-_]?account/gi];
    var foundElems, map;
    foundElems = document.querySelectorAll("a, button, span, div, img");
    filter = Array.prototype.filter;
    map = Array.prototype.map;
    return map.call(filter.call(foundElems, function(elem){
        if(type == 'login'){
            return (/log[\s-_]?[io]n/gi).test(elem);
        }else if(type == 'signup'){
            if((/sign[\s-_]?up/gi).test(elem) || (/create[\s-_]?account/gi).test(elem)){
                return true;
            }
        }
    }), function(elem){
        return elem.getAttribute('href');
    });
}
function searchForSSO(type) {
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
                    processSingleNode(current, type);
            }
        }
    }  
}

function processSingleNode(node, type){
    if(filterNode(node)){
        strToCheck = makeAttrString(node);
        checkForKeywords(strToCheck, type); 
    }
}

function filterNode(current){
    if (current.nodeName != "A" && current.nodeName != "DIV" && current.nodeName != "IMG" &&
        current.nodeName != "SPAN" && current.nodeName != "INPUT" &&
        current.nodeName != "BUTTON") return false;
    if (current.nodeName == "INPUT") {
        if (current.type != "button" && current.type != "img" &&
            current.type != "submit") return false;
    }
    if (current.nodeName == "A") {
        if (current.href.toLowerCase().indexOf('mailto:') == 0) return false;
    }
    return true;
}

function makeAttrString(node){
    var str = '';
    var attribs = node.attributes;
    for(var i=0; i < attribs.length; i++){
        str += attribs[i].name + "=" + attribs[i].value + ";"
    }
    return str;
}

function checkForKeywords(inputstr, type){
    sso = [{"site" : /google/gi, "url" : ["https://accounts.google.com/o/oauth2/auth"]}, 
        {"site" : /yahoo/gi, "url" : ["https://api.login.yahoo.com/oauth2/request_auth"]}, 
        {"site" : /500px/gi, "url": ["https://api.500px.com/v1/oauth"]}, 
        {"site" : /aol/gi, "url" :["https://api.screenname.aol.com/auth"]}, 
        {"site" : /twitter/gi, "url" : ["https://api.twitter.com/oauth"]}, 
        {"site" : /vk/gi, "url" : ["https://oauth.vk.com/authorize"]}, 
        {"site" : /yammer/gi, "url" : ["https://www.yammer.com/oauth2/authorize"]}, 
        {"site" : /yandex/gi, "url" : ["https://oauth.yandex.com/authorize"]},
        {"site" : /zendesk/gi, "url" : [".zendesk.com/oauth/authorizations/new"]}, 
        {"site" : /amazon/gi, "url" : ["http://g-ecx.images-amazon.com/images/G/01/lwa/btnLWA", "https://images-na.ssl-images-amazon.com/images/G/01/lwa/btnLWA"]},
        {"site" : /flickr/gi, "url" : ["https://www.flickr.com/services/oauth"]}, 
        {"site" : /bitbucket/gi, "url" : ["https://bitbucket.org/site/oauth2", "https://bitbucket.org/api/1.0/oauth"]}, 
        {"site" : /bitly/gi, "url" : ["https://bitly.com/oauth"]}, 
        {"site" : /cloud[\-\S]?foundry/gi, "url" : ["/uaa/oauth"]}, 
        {"site" : /dailymotion/gi, "url" : ["https://www.dailymotion.com/oauth"]}, 
        {"site" : /deviantART/gi, "url" : ["https://www.deviantart.com/oauth2"]}, 
        {"site" : /discogs/gi, "url" : ["https://api.discogs.com/oauth"]}, 
        {"site" : /huddle/gi, "url" : ["https://login.huddle.net/request"]}, 
        {"site" : /netflix/gi, "url" : ["https://api-user.netflix.com/oauth"]}, 
        {"site" : /openlink[\-\S]?data[\-\S]?spaces/gi, "url" : ["/OAuth"]}, 
        {"site" : /openstreetmap/gi, "url" : ["http://www.openstreetmap.org/oauth"]}, 
        {"site" : /opentable/gi, "url" : ["http://www.opentable.com/oauth"]}, 
        {"site" : /passport/gi, "url" : ["/dialog/authorize", "oauth2/authorize", "oauth/authorize"]},
        {"site" : /paypal/gi, "url" : ["paypal.com/v1/oauth2"]}, 
        {"site" : /plurk/gi, "url" : ["https://www.plurk.com/OAuth/authorize"]},
        {"site" : /sina[\-\S]?weibo/gi, "url" : ["http://api.t.sina.com.cn/oauth/authorize"]},
        {"site" : /stack[\-\S]?exchange/gi, "url" : ["https://stackexchange.com/oauth"]}, 
        {"site" : /statusnet/gi, "url" : ["status.net/api/oauth/authorize"]}, 
        {"site" : /ubuntu[\-\S]?one/gi, "url" : ["https://login.ubuntu.com/api/1.0/authentications"]},
        {"site" : /viadeo/gi, "url" : ["https://partners.viadeo.com/oauth/authorize"]},
        {"site" : /vimeo/gi, "url" : ["https://api.vimeo.com/oauth/authorize"]}, 
        {"site" : /withings/gi, "url" : ["https://oauth.withings.com/account/authorize"]},
        {"site" : /xero/gi, "url" : ["https://api.xero.com/oauth/Authorize"]},
        {"site" : /xing/gi, "url" : ["https://api.xing.com/v1/authorize"]}, 
        {"site" : /goodreads/gi, "url" : ["http://www.goodreads.com/oauth"]}, 
        {"site" : /google[\-\S]?app[\-\S]?engine/gi, "url" : ["https://accounts.google.com/o/oauth2/v2/auth"]},
        {"site" : /groundspeak/gi, "url" : ["groundspeak.com/oauth"]}, 
        {"site" : /intel[\-\S]?cloud[\-\S]?services/gi, "url" : []}, 
        {"site" : /jive/gi, "url" : ["jiveon.com/oauth2"]}, 
        {"site" : /linkedin/gi, "url" : ["https://www.linkedin.com/oauth/v2/authorization"]}, 
        {"site" : /trello/gi, "url" : ["https://trello.com/1/OAuthAuthorizeToken", "https://trello.com/1/authorize"]}, 
        {"site" : /tumblr/gi, "url" : ["https://www.tumblr.com/oauth/authorize"]}, 
        {"site" : /microsoft/gi, "url" : ["https://login.live.com/oauth20"]},
        {"site" : /mixi/gi, "url" : ["api.mixi-platform.com/OAuth"]}, 
        {"site" : /myspace/gi, "url" : ["api.myspace.com/authorize"]}, 
        {"site" : /etsy/gi, "url" : ["https://www.etsy.com/oauth"]}, 
        {"site" : /evernote/gi, "url" : ["https://sandbox.evernote.com/OAuth.action"]},  
        {"site" : /yelp/gi, "url" : ["https://api.yelp.com/oauth2"]},  
        {"site" : /facebook/gi, "url" : ["fb-login-button", "https://www.facebook.com/v2.0/dialog/oauth"]},
        {"site" : /dropbox/gi, "url" : ["https://www.dropbox.com/1/oauth2/authorize", "https://www.dropbox.com/1/oauth/authorize"]}, 
        {"site" : /twitch/gi, "url" : ["https://api.twitch.tv/kraken/oauth2/authorize"]},
        {"site" : /stripe/gi, "url" : ["https://connect.stripe.com/oauth/authorize"]},
        {"site" : /basecamp/gi, "url" : ["https://launchpad.37signals.com/authorization/new"]},
        {"site" : /box/gi, "url" : ["https://account.box.com/api/oauth2/authorize"]},
        {"site" : /formstack/gi, "url" : ["https://www.formstack.com/api/v2/oauth2/authorize"]},
        {"site" : /github/gi, "url" : ["https://github.com/login/oauth/authorize"]},
        {"site" : /reddit/gi, "url" : ["https://www.reddit.com/api/v1/authorize"]},
        {"site" : /instagram/gi, "url" : ["https://api.instagram.com/oauth/authorize"]},
        {"site" : /foursquare/gi, "url" : ["https://foursquare.com/oauth2/authorize"]},
        {"site" : /fitbit/gi, "url" : ["https://www.fitbit.com/oauth2/authorize"]},
        {"site" : /imgur/gi, "url" : ["https://api.imgur.com/oauth2/authorize"]},
        {"site" : /salesforce/gi, "url" : ["https://login.salesforce.com/services/oauth2/authorize"]},
        {"site" : /strava/gi, "url" : ["https://www.strava.com/oauth/authorize"]},
        {"site" : /battle.net/gi, "url" : ["https://us.battle.net/oauth/authorize"]}]
        k0 = /oauth/gi;
        k1 = /openid/gi
        k2 = /log[\-\S]?[io]n/gi;
        k3 = /sign[\-\S]?[io]n/gi;
        k4 = /sign[\-\S]?up/gi;
        e0 = /social/gi;
        e1 = /subscribe/gi;
        e2 = /connect/gi;
        e3 = /like/gi;

        for(each of sso){
            compiled = each.site
            if(compiled.test(inputstr)){
                if(k0.test(inputstr)){
                    urllen = each.url.length;
                    if(urllen > 0){
                        for(url of each.url){
                            if(inputstr.search(url) != null){
                                if(type == 'login'){
                                    if(k2.test(inputstr) || k3.test(inputstr)){
                                        
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
            
            
                
                    if (each.url).length > 0:
                        for url in each['url']:
                            c_url = re.compile(url, re.I)
                            if c_url.search(inputstr) is not None:
                                if stype == 'login':
                                    if k2.search(inputstr) is not None or k3.search(inputstr) is not None:
                                        if each['site'] not in self.sso_info["loginSSO"]:
                                            self.sso_info["url"] = self.first_url
                                            self.sso_info["loginSSO"].append(each['site'])
                                elif stype == 'signup':
                                    if each['site'] not in self.sso_info["signupSSO"]:
                                        self.sso_info["url"] = self.first_url
                                        self.sso_info["signupSSO"].append(each['site'])
                    else:
                        if stype == 'login':
                            if k2.search(inputstr) is not None or k3.search(inputstr) is not None:
                                if each['site'] not in self.sso_info["loginSSO"]:
                                    self.sso_info["url"] = self.first_url
                                    self.sso_info["loginSSO"].append(each['site'])
                        elif stype == 'signup':
                            if each['site'] not in self.sso_info["signupSSO"]:
                                self.sso_info["url"] = self.first_url
                                self.sso_info["signupSSO"].append(each['site'])
                elif k1.search(inputstr) is not None:
                    if stype == 'login':
                        if k2.search(inputstr) is not None or k3.search(inputstr) is not None:
                            if each['site'] not in self.sso_info["loginSSO"]:
                                self.sso_info["url"] = self.first_url
                                self.sso_info["loginSSO"].append(each['site'])
                    elif stype == 'signup':
                        if each['site'] not in self.sso_info["signupSSO"]:
                            self.sso_info["url"] = self.first_url
                            self.sso_info["signupSSO"].append(each['site'])


}
/* ---------------------------------------------------- Search functions end ----------------------------------------------- */

/* ------------------------------------Function calls and program start here ------------------------------------------------  */
casper.start().then(function() {
    this.echo("Starting");
});
readWebsitesFromCSV();

casper.run(check);