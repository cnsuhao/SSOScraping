//Modules required
var async = require('async');
var fs = require('fs');
var Nightmare = require('nightmare');
require('nightmare-download-manager')(Nightmare);

function run(rank, url, findLinks, cb){
    // console.log(url);
    var ssoInfo = {"rank" : rank, "url" : url, "sso" : [], "timeTaken" : ''};
    var start = Date.now();
    var nightmare = Nightmare({
        show: false,
        ignoreDownloads: true,
        gotoTimeout: 60000,
        waitTimeout: 60000,
        loadTimeout: 60000,
        executionTimeout: 60000,
        switches: {
            'ignore-certificate-errors': true
        }
    });
    nightmare.goto(url)
    .wait()
    .evaluate((findLinks) => {
        var ssoProviders = [
            {"site" : "google", "regex" : /google/gi, "url" : ["https://accounts.google.com/o/oauth2/auth", "https://accounts.google.com/ServiceLogin"]}, 
            {"site" : "yahoo", "regex" : /yahoo/gi, "url" : ["https://api.login.yahoo.com/oauth2/request_auth"]}, 
            {"site" : "500px", "regex" : /500px/gi, "url": ["https://api.500px.com/v1/oauth"]}, 
            {"site" : "aol", "regex" : /aol/gi, "url" :["https://api.screenname.aol.com/auth"]}, 
            {"site" : "twitter", "regex" : /twitter/gi, "url" : ["https://api.twitter.com/oauth"]}, 
            {"site" : "vk", "regex" : /vk/gi, "url" : ["https://oauth.vk.com/authorize"]},
            {"site" : "vkontakte", "regex" : /vk/gi, "url" : ["https://oauth.vk.com/authorize"]}, 
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
            {"site" : "fb", "regex" : /fb/gi, "url" : ["fb-login-button", "https://www.facebook.com/v2.0/dialog/oauth",  "https://www.facebook.com/v2.3/dialog/oauth", "https://graph.facebook.com/v2.8/oauth/authorize"]},
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
            {"site" : "battle.net", "regex" : /battle.net/gi, "url" : ["https://us.battle.net/oauth/authorize"]}
        ];
        var checkLinkWords = function(inputstr) {
            var l1 = /log[\-\s]*[io]+n/gi; var l2 = /sign[\-\s]*[io]+n/gi; var l3 = /sign[\-\s]*up+/gi; var l4 = /create[\-\s]*account+/gi; var l5 = /register/gi;
            var l6 = /get[\-\s]started/gi; var l7 = /registration/gi; var l8 = /existing[\-\s]user/gi; var l9 = /join/gi;

            var e0 = /social/gi; var e1 = /subscribe/gi; var e2 = /connect/gi; var e3 = /like/gi; var e4 = /support/gi;
            var e5 = /recovery/gi; var e6 = /forgot/gi; var e7 = /help/gi; var e8 = /promo[tion]*/gi; 
            var e9 = /privacy[\-\s]*[policy]*/gi; var e10 = /sports/gi; var e11 = /story/gi; var e12 = /campaign/gi;
            var e13 = /questions/gi; var e14 = /store/gi; var e15 = /itunes/gi; var e16 = /play\.google/gi;
            var e17 = /graph\.facebook/gi; var e18 = /jobs/gi; var e19 = /pdf/gi; var e20 = /doc/gi; var e21 = /jsp/gi;
            var e22 = /entry/gi; var e23 = /exe/gi; var e24 = /download/gi; var e25 = /newsletter/gi; var e26 = /comment/gi;
            var e27 = /article/gi; var e28 = /entertainment/gi; var e29 = /competition/gi; var e30 = /meeting/gi;

            if(inputstr.match(e0) == null && inputstr.match(e1) == null  && inputstr.match(e2) == null && 
                inputstr.match(e3) == null && inputstr.match(e4) == null && inputstr.match(e5) == null &&
                inputstr.match(e6) == null && inputstr.match(e7) == null && inputstr.match(e8) == null &&
                inputstr.match(e9) == null && inputstr.match(e10) == null && inputstr.match(e11) == null &&
                inputstr.match(e12) == null && inputstr.match(e13) == null && inputstr.match(e14) == null
                && inputstr.match(e15) == null && inputstr.match(e16) == null && inputstr.match(e17) == null 
                && inputstr.match(e18) == null && inputstr.match(e19) == null && inputstr.match(e20) == null
                && inputstr.match(e21) == null && inputstr.match(e22) == null && inputstr.match(e23) == null
                && inputstr.match(e24) == null && inputstr.match(e25) == null && inputstr.match(e26) == null && 
                inputstr.match(e27) == null &&  inputstr.match(e28) == null &&  inputstr.match(e29) == null
                &&  inputstr.match(e30) == null){
                if(inputstr.match(l1) != null || inputstr.match(l2) != null || 
                    inputstr.match(l3) != null || inputstr.match(l4) != null || inputstr.match(l5) != null 
                    || inputstr.match(l6) != null || inputstr.match(l7) != null || inputstr.match(l8) != null ||
                    inputstr.match(l9) != null){
                    return true;
                   }
            }
            return false;
        };
        var extractLink = function(node) {
            var parent = node.parentElement;
            var val = node.getAttribute('href') || node.getAttribute('onclick') || node.getAttribute('action');
            if (val)
                return val;
            else if (parent)
                return parent.getAttribute('href') || parent.getAttribute('onclick') || parent.getAttribute('action');
            return null;
        };
        var checkSSOWords = function(inputstr){
            var k0 = /oauth/gi;
            var k1 = /openid/gi
            var k2 = /log[\-\s]*[io]+n[\-\s]*[with]+[using]+/gi;
            var k3 = /sign[\-\s]*[io]+n[\-\s]*[with]+[using]+/gi;
            var k4 = /sign[\-\s]*[up]+[\-\s]*[with]+[using]+/gi;
            var k5 = /register[\-\s]*[up]+[\-\s]*[with]+[using]+/gi;
            var k6 = /create[\-\s]*[up]+[\-\s]*[with]+[using]+/gi;
            var k7 = /continue[\-\s]*[with]+[using]+/gi;
            var k8 = /log[\-\s]*[io]+n/gi; var k9 = /sign[\-\s]*[io]+n/gi; var k10 = /sign[\-\s]*[up]+/gi;
            var k11 = /openid[\-\s]*[auth]+/gi; var k12 = /openid[\-\s]*[provider]+/gi; var k13 = /openid[\-\s]*[url]+/gi;
            var k14 = /openid[\-\s]*[login]+/gi; var k15 = /openid[\-\s]*[signin]+/gi; var k16 = /openid[\-\s]*[signup]+/gi;
            var k17 = /social/gi; var k18 = /provider/gi; var k19 = /auth/gi; var k20 = /third[\s]*party/gi; 
            var k21 = /button/gi; var k22 = /btn/gi; var k23 = /janrain/gi; var k24 = /gigya/gi; var k25 = /plugin/gi;
            var k26 = /authentication/gi;
            var len = ssoProviders.length;
            var i = 0;

            while(i < len){
                var each = ssoProviders[i];
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
                                    return each.site+", oauth-url";
                                }
                            }
                        }
                        if(each.site != 'box' && each.site != 'vk' && each.site != '500px' && each.site != 'fb'){
                            if(inputstr.match(k8) != null || inputstr.match(k9) != null || inputstr.match(k10) != null){
                                return each.site+", oauth-keyword";
                            }
                        }
                    }else if(openMatch != null){
                        if(each.site != 'box' && each.site != 'vk' && each.site != '500px' && each.site != 'fb'){
                            if(inputstr.match(k11) != null || inputstr.match(k12) != null || inputstr.match(k13) != null 
                                || inputstr.match(k14) != null || inputstr.match(k15) != null || inputstr.match(k16) != null){
                                return each.site+", openid";
                            }
                        }  
                    }else{
                        if(each.site != 'box' && each.site != 'vk' && each.site != '500px' && each.site != 'fb'){
                            if(inputstr.match(k2) != null || inputstr.match(k3) != null  || inputstr.match(k4) != null || 
                                inputstr.match(k5) != null || inputstr.match(k6) != null || inputstr.match(k7) != null){
                                return each.site+", no-url";
                            }else if(inputstr.match(k17) != null || inputstr.match(k23) != null ||
                                inputstr.match(k24) != null){
                                if(inputstr.match(k18) != null || inputstr.match(k8) != null || inputstr.match(k9) != null 
                                    || inputstr.match(k10) != null){
                                    return each.site+", no-url";
                                }
                            }else if(inputstr.match(k20) != null){
                                if(inputstr.match(k18) != null || inputstr.match(k8) != null
                                || inputstr.match(k9) != null || inputstr.match(k10) != null){
                                    return each.site+", no-url";
                                }
                            }else if(inputstr.match(k26) != null){
                                if(inputstr.match(k18) != null || inputstr.match(k8) != null
                                || inputstr.match(k9) != null || inputstr.match(k10) != null){
                                    return each.site+", no-url";
                                }
                            }else if(inputstr.match(k21) != null || inputstr.match(k22) != null){
                                if(inputstr.match(k17) != null || inputstr.match(k18) != null || 
                                    inputstr.match(k20) != null || inputstr.match(k26) != null || inputstr.match(k8) != null || 
                                    inputstr.match(k9) != null || inputstr.match(k10) != null){
                                    return each.site+", no-url";
                                }
                            }
                        } 
                    }
                }
                i++;
            }
        };

        var providers = new Set();
        var links = new Set();
        var nodes = document.querySelectorAll("a, div, img, span, input, button, iframe, form");
        for (let node of nodes) {
            if (node.nodeName == "A" && node.href.toLowerCase().startsWith("mailto:"))
                continue;
            if (node.nodeName == "INPUT" && node.type != "button" && node.type != "img" && node.type != "submit")
                continue;
            if (node.attributes.size == 0)
                continue;

            // Construct a string containing the text contents
            // of the immediate children's text nodes and the
            // current node's attributes.
            var attrStr = '';
            for (let child of node.children) {
                if (child.nodeType === 3)
                    attrStr += child.textContent;
            }
            attrStr = attrStr.trim() || '';
            for (let attrib of node.attributes)
                attrStr += ';' + attrib.name + '=' + attrib.value;

            // Look for SSO markers.
            var sso = checkSSOWords(attrStr);
            if (sso) {
                providers.add(sso);
            } else if (findLinks) {
                // Look for links.
                if (checkLinkWords(attrStr)) {
                    var link = node.getAttribute('href') || node.getAttribute('onclick') || node.getAttribute('action');
                    if (!link) {
                        var p = node.parentElement;
                        link = p.getAttribute('href') || p.getAttribute('onclick') || p.getAttribute('action');
                    }
                    if (link) {
                        if (link.startsWith('http://') || link.startsWith('https://'))
                            links.add(link);
                        else if (link.startsWith('//'))
                            links.add(window.location.protocol + link);
                        else if (link.startsWith('/'))
                            links.add(window.location.protocol + "//" + window.location.hostname + link);
                    }
                }
            }
        }

        // I think this should be unconditional.
        if (findLinks && links.size == 0) {
            links.add(window.location.protocol + "//" + window.location.hostname + '/login');
            links.add(window.location.protocol + "//" + window.location.hostname + '/signup');
        }
        return { "candidates": [...providers], "links": [...links] };
    }, findLinks)
    .end()
    .then((result) => {
        var links = [];
        if(result){
            ssoInfo['sso'] = result.candidates;
            var i = 0;
            for(let link of result.links){
                if (++i == 3)
                    break;
                links.push(link);
              }
        }
        ssoInfo['timeTaken'] = (Date.now() - start) + "ms";
        cb(ssoInfo, links);
    })
    .catch((error) => {
        //console.error('Search failed:', error);
        ssoInfo["error"] = error;
        ssoInfo['timeTaken'] = (Date.now() - start) + "ms";
        cb(ssoInfo, []);
    });
}

function log(result) {
    console.log(JSON.stringify(result));
}


if (require.main === module) {
    // console.log('hi')
    var workers = 10;
    var opt = require('node-getopt').create([
        ['w', 'workers=NUM', 'number of nightmare.js instances'],
        ['h', 'help'       , 'display this help']
    ])
    .bindHelp()
    .setHelp("Usage: node main.js [OPTION...] [FILE...]\n\nOptions:\n[[OPTIONS]]")
    .on('workers', (argv, options) => workers = Number(options.workers))
    .parseSystem();

    // Create an asynchronous queue.
    var queue = async.queue((task, cb) => {
        run(task.rank, task.url, task.findLinks, cb);
    }, 10);

    for (let file of opt.argv) {
        var data = fs.readFileSync(file, {encoding: 'utf-8'});
        var sites = data.split("\n").map((line) => line.split(",", 2));
        // Add all of the sites to the queue.
        for (let [rank, domain] of sites) {
            var task = { "rank": rank, "url": "http://"+domain, "findLinks": true };
            queue.push(task, (ssoInfo, links) => {
                log(ssoInfo);
                for (let url of links) {
                    var task = { "rank": rank, "url": url, "findLinks": false };
                    queue.unshift(task, (ssoInfo, links) => { log(ssoInfo); });
                }
            });
        }
    }
}

// vim: set ts=8 sts=4 sw=4 expandtab:
