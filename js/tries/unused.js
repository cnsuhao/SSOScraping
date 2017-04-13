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

var filter, map;
    filter = Array.prototype.filter;
    map = Array.prototype.map;
    return map.call(filter.call(document.querySelectorAll("a"), function(a) {
        return (/^http:\/\/.*/i).test(a.getAttribute("href"));
    }), function(a) {
        return a.getAttribute("href");
    });




this.echo(found[0] + " links found on " + link);
        if(found[0] != null && found[0] != undefined){
            stringified = found[0].toString();
            if(stringified.startsWith("/")){
                stringified = link.concat(stringified);
            }
            this.loginLink = stringified;
        }




























        function searchForSSO(type) {
    var stack = [];
    var results = [];
    result = '';
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
                    result = processSingleNode(current, type);
            }
        }
    }
    return "";
}



function processSingleNode(node, type){
    if(filterNode(node)){
        strToCheck = makeAttrString(node);
        result = checkForKeywords(strToCheck, type);
    }
    return result;
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
        {"site" : /cloud[\-\S]foundry/gi, "url" : ["/uaa/oauth"]}, 
        {"site" : /dailymotion/gi, "url" : ["https://www.dailymotion.com/oauth"]}, 
        {"site" : /deviantART/gi, "url" : ["https://www.deviantart.com/oauth2"]}, 
        {"site" : /discogs/gi, "url" : ["https://api.discogs.com/oauth"]}, 
        {"site" : /huddle/gi, "url" : ["https://login.huddle.net/request"]}, 
        {"site" : /netflix/gi, "url" : ["https://api-user.netflix.com/oauth"]}, 
        {"site" : /openlink[\-\S]data[\-\S]spaces/gi, "url" : ["/OAuth"]}, 
        {"site" : /openstreetmap/gi, "url" : ["http://www.openstreetmap.org/oauth"]}, 
        {"site" : /opentable/gi, "url" : ["http://www.opentable.com/oauth"]}, 
        {"site" : /passport/gi, "url" : ["/dialog/authorize", "oauth2/authorize", "oauth/authorize"]},
        {"site" : /paypal/gi, "url" : ["paypal.com/v1/oauth2"]}, 
        {"site" : /plurk/gi, "url" : ["https://www.plurk.com/OAuth/authorize"]},
        {"site" : /sina[\-\S]weibo/gi, "url" : ["http://api.t.sina.com.cn/oauth/authorize"]},
        {"site" : /stack[\-\S]exchange/gi, "url" : ["https://stackexchange.com/oauth"]}, 
        {"site" : /statusnet/gi, "url" : ["status.net/api/oauth/authorize"]}, 
        {"site" : /ubuntu[\-\S]one/gi, "url" : ["https://login.ubuntu.com/api/1.0/authentications"]},
        {"site" : /viadeo/gi, "url" : ["https://partners.viadeo.com/oauth/authorize"]},
        {"site" : /vimeo/gi, "url" : ["https://api.vimeo.com/oauth/authorize"]}, 
        {"site" : /withings/gi, "url" : ["https://oauth.withings.com/account/authorize"]},
        {"site" : /xero/gi, "url" : ["https://api.xero.com/oauth/Authorize"]},
        {"site" : /xing/gi, "url" : ["https://api.xing.com/v1/authorize"]}, 
        {"site" : /goodreads/gi, "url" : ["http://www.goodreads.com/oauth"]}, 
        {"site" : /google[\-\S]app[\-\S]engine/gi, "url" : ["https://accounts.google.com/o/oauth2/v2/auth"]},
        {"site" : /groundspeak/gi, "url" : ["groundspeak.com/oauth"]}, 
        {"site" : /intel[\-\S]cloud[\-\S]services/gi, "url" : []}, 
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

        return "hello";
        // for(var i=0; i < sso.length; i++){
        //     each = sso[i];
        //     compiled = each.site
        //     if(inputstr.match(compiled) != null){
        //         if(inputstr.match(k0) != null){
        //             urlList = each.url;
        //             urllen = urlList.length;
        //             if(urllen > 0){
        //                 for(var j=0; j < urllen; j++){
        //                     if(inputstr.match(urlList[j]) != null){
        //                         if(type == 'login'){
        //                             if(k2.test(inputstr) || k3.test(inputstr)){
        //                                 // if(single['login'].indexOf(each.site) == -1){
        //                                     // single['login'].push(each.site);
        //                                 // }
        //                             }
        //                         }else if(type == 'signup'){
        //                             // if(single['signup'].indexOf(each.site) == -1){
        //                                 // single['signup'].push(each.site);
        //                             // }
        //                         }
        //                     }
        //                 }
        //             }else{
        //                 if(type == 'login'){
        //                     if(inputstr.match(k2) != null || inputstr.match(k3) != null){
        //                         // if(single['login'].indexOf(each.site) == -1){
        //                             // single['login'].push(each.site);
        //                         // }
        //                     }
        //                 }else if(type == 'signup'){
        //                     // if(single['signup'].indexOf(each.site)==-1){
        //                         // single['signup'].push(each.site);
        //                     // }
        //                 }
        //             }
        //         }else if(inputstr.match(k1) != null){
        //             if(type == 'login'){
        //                 if(inputstr.match(k2)!= null || inputstr.match(k3) != null){
        //                     // if(single['login'].indexOf(each.site) == -1){
        //                         // single['login'].push(each.site);
        //                     // }
        //                 }
        //             }else if(type == 'signup'){
        //                 // if(single['signup'].indexOf(each.site)==-1){
        //                     // single['signup'].push(each.site);
        //                 // }
        //             }
        //         }
        //     }
        // }
}




function getWebsites(){
    try{
        var data = fs.readFileSync('../data/top-1000.csv', 'utf8');
        var arr = data.split(/\r?\n/);
        sites = arr.map(function(val, index, arr){
            return val = "https://www." + val.split(',')[1];
        });
        console.log(sites.length);
        return sites;
    }catch(e){
        console.log("File read error : " + e);
    }
    
}

//Variable declaration
var websites = getWebsites();
// var websites = ["https://www.stackoverflow.com"]



function makeObjectsUnique(list){
    var i; var newList = [];
    Array.prototype.contains = function(v){
        for(var i = 0; i < this.length; i++) {
            if(this[i] === v) return true;
        }
        return false;
    };
    Array.prototype.unique = function(){
        var arr = [];
        for(var i = 0; i < this.length; i++) {
            if(!arr.contains(this[i])) {
                arr.push(this[i]);
            }
        }
        return arr; 
    };
    newList = list.unique();
    return newList;
}





















while(array.length > 0){
        var link = "https://www." + array.shift();
        var ssoInfo = {"parent" : "none", "url" : link, "sso" : []};
        var start = Date.now();
        var nightmare = Nightmare({
            gotoTimeout : 30000,
            show : false
        });
        nightmare
            .goto(link)
            .evaluate(function(){
                window.fns = {
                    prefilter : function(node){
                        var bool = true;
                        if (node.nodeName != "A" && node.nodeName != "DIV" && node.nodeName != "IMG" &&
                            node.nodeName != "SPAN" && node.nodeName != "INPUT" &&
                            node.nodeName != "BUTTON") bool = false;
                        if (node.nodeName == "INPUT") {
                            if (node.type != "button" && node.type != "img" &&
                                node.type != "submit") bool = false;
                        }
                        if (node.nodeName == "A") {
                            if (node.href.toLowerCase().indexOf('mailto:') == 0) bool = false;
                        }
                        return bool;
                    },
                    processDOM : function(){
                        var tree = []; var candidates = []; var sites = []; var result = {"candidates" : [], "links" : []};
                        tree.push(document.body);
                        while(tree.length > 0){
                            var branch = tree.pop();
                            if(branch != null){
                                var children = branch.children;
                                if(children){
                                    var arr = [].slice.call(children);
                                    tree = tree.concat(arr);
                                }
                                if(!(branch.attributes == null || branch.nodeName == 'SCRIPT' || branch.nodeName == 'EMBED')){
                                    if(this.prefilter(branch)){
                                        var sso = this.hasSSO(branch);
                                        if(sso){
                                            if(candidates.indexOf(sso) == -1) candidates.push(sso);
                                        }else{
                                            var link = this.hasLinks(branch);
                                            if(link && sites.indexOf(link) == -1) sites.unshift(link);
                                        }
                                    }
                                }
                            }
                        }
                        result.candidates = candidates;
                        result.links = this.limitLinks(sites);
                        if(result.links.length == 0) result.links = this.makeNewLinks();
                        return result;
                    },
                    hasLinks : function(node){
                        var attrStr = this.makeAttrString(node);
                        if(this.checkLinkWords(attrStr)){
                            return this.extractLink(node);
                        }
                    },
                    checkLinkWords : function(inputstr){
                        var l1 = /log[\-\s]*[io]+n/gi;
                        var l2 = /sign[\-\s]*[io]+n/gi;
                        var l3 = /sign[\-\s]*up+/gi;
                        var l4 = /create[\-\s]*account+/gi;
                        var l5 = /register/gi;
                        var e0 = /social/gi; var e1 = /subscribe/gi; var e2 = /connect/gi; var e3 = /like/gi; var e4 = /support/gi;
                        var e5 = /recovery/gi; var e6 = /forgot/gi; var e7 = /help/gi; var e8 = /promo[tion]*/gi; 
                        var e9 = /privacy[\-\s]*[policy]*/gi; var e10 = /sports/gi; var e11 = /story/gi; var e12 = /campaign/gi;
                        var e13 = /questions/gi; var e14 = /store/gi; var e15 = /itunes/gi; var e16 = /play\.google/gi;
                        var e17 = /graph\.facebook/gi;

                        if(inputstr.match(e0) == null && inputstr.match(e1) == null  && inputstr.match(e2) == null && 
                            inputstr.match(e3) == null && inputstr.match(e4) == null && inputstr.match(e5) == null &&
                            inputstr.match(e6) == null && inputstr.match(e7) == null && inputstr.match(e8) == null &&
                            inputstr.match(e9) == null && inputstr.match(e10) == null && inputstr.match(e11) == null &&
                            inputstr.match(e12) == null && inputstr.match(e13) == null && inputstr.match(e14) == null
                            && inputstr.match(e15) == null && inputstr.match(e16) == null && inputstr.match(e17) == null){
                            if(inputstr.match(l1) != null || inputstr.match(l2) != null || 
                                inputstr.match(l3) != null || inputstr.match(l4) != null || inputstr.match(l5) != null){
                                return true;
                            }
                        }
                        return false;
                    },
                    extractLink :  function(node){
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
                    },
                    makeAttrString : function(node){
                        var str = '';
                        var attribs = node.attributes;
                        for(var i=0; i < attribs.length; i++){
                            str += attribs[i].name + "=" + attribs[i].value + ";"
                        }
                        return str;
                    },
                    hasSSO : function(node){
                        var attrStr = this.makeAttrString(node);
                        var result = this.checkSSOWords(attrStr);
                        if(result) return result;
                    },
                    checkSSOWords : function(inputstr){
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
                            {"site" : "facebook", "regex" : /facebook/gi, "url" : ["fb-login-button", "https://www.facebook.com/v2.0/dialog/oauth",  "https://www.facebook.com/v2.3/dialog/oauth", "https://graph.facebook.com/v2.8/oauth/authorize"]},
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

                        var len = sso.length;
                        var i = 0;

                        while(i < len){
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
                                                return each.site+", oauth";
                                            }
                                        }
                                    }
                                }else if(openMatch != null){
                                    return each.site+", openid";
                                }else{
                                    if(inputstr.match(k2) != null || inputstr.match(k3) != null  || inputstr.match(k4) != null || 
                                        inputstr.match(k5) != null || inputstr.match(k6) != null){
                                        return each.site+', edgecase';
                                    }
                                }
                            }
                            i++;
                        }
                    },
                    limitLinks : function(links){
                        var filtered = [];
                        var len = links.length;
                        for(var i = 0; i < len; i++){
                            if((/^http/gi).test(links[i])){
                                filtered.push(links[i]);
                            }
                        }
                        if(filtered.length == 0){
                            for(var i = 0; i < len; i++){
                                var each = links[i];
                                if(each[0] == '/' && each[1] == '/'){
                                    each = "https:" + each;
                                    filtered.push(each);
                                }else if(each[0] == '/' && each[1] != '/'){
                                    each = "https://" + window.location.hostname + each;
                                    filtered.push(each);
                                }
                            }
                        }
                        Array.prototype.contains = function(v){
                            for(var i = 0; i < this.length; i++) {
                                if(this[i] === v) return true;
                            }
                            return false;
                        };
                        Array.prototype.unique = function(){
                            var arr = [];
                            for(var i = 0; i < this.length; i++) {
                                if(!arr.contains(this[i])) {
                                    arr.push(this[i]);
                                }
                            }
                            return arr; 
                        };
                        var uniq = filtered.unique();
                        return uniq;
                    },
                    makeNewLinks : function(){
                        var arr = ["https://" + window.location.hostname + '/login', 
                        "https://" + window.location.hostname + '/signup'];
                        return arr;
                    }
                };
                return fns.processDOM();
            })
            .end()
            .then(function (result) {
                if(result){
                    ssoInfo.sso = result.candidates;
                    if(ssoInfo['sso'].length > 0) write(ssoInfo, 0);
                    links = links.concat(result.links);
                    rerun(links, link);
                }
                var end = Date.now();
                var time = {"url" : link, "timeTaken" : (end - start)+"ms"};
                write(time, 2);
            })
            .catch(function (error) {
                console.error('run');
               console.error('Search failed:', error);
               write(error, 1);
            });
        num++;
    }
