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
