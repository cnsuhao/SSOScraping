'use strict';

//Modules required
let fs = require('fs');
let Nightmare = require('nightmare');
require('nightmare-download-manager')(Nightmare);

//Variable declaration
let links = [];
let allResults = [];
let count = 0;
let runType = 0;

//Get command line arg and run
let logFileName = JSON.parse(process.argv[2]);
let sites = JSON.parse(process.argv.slice(3));
run(sites);

function run(list){
	list.reduce(function(accumulator, initial){
		return accumulator.then(function(results){
			let rank = initial[0]; let link = initial[1]; let url = '';
			if(runType == 0) url = "http://www." + link;
			else url = link;
			console.log(url);

			let nightmare = Nightmare({
				show: false,
				ignoreDownloads: true,
				gotoTimeout: 60000,
				switches: {
					'ignore-certificate-errors': true
				}
			});

			return nightmare.goto(url)
			.evaluate(function(runType){
				window.fns = {
					prefilter : function(node){
			    		let bool = true;
		                if (node.nodeName != "A" && node.nodeName != "DIV" && node.nodeName != "IMG" &&
		                    node.nodeName != "SPAN" && node.nodeName != "INPUT" &&
		                    node.nodeName != "BUTTON" && node.nodeName != "FORM") bool = false;
		                if (node.nodeName == "INPUT") {
		                    if (node.type != "button" && node.type != "img" &&
		                        node.type != "submit") bool = false;
		                }
		                if (node.nodeName == "A") {
		                    if (node.href.toLowerCase().indexOf('mailto:') == 0) bool = false;
		                }
		                return bool;
			    	},
			    	makeAttrString : function(node){
		            	let txt = '';
		            	for (let i = 0; i < node.childNodes.length; ++i)
							if (node.childNodes[i].nodeType === 3)
								txt += node.childNodes[i].textContent;
			    		let str = txt.trim() || '';
		                let attribs = node.attributes;
		                for(let i=0; i < attribs.length; i++){
		                    str += attribs[i].name + "=" + attribs[i].value + ";"
		                }
		                return str;
			    	},
					processDOM : function(){
						let tree = []; let result = {"candidates" : [], "links" : []}; let links = []; let ssos = [];
			    		tree = [].slice.call(document.querySelectorAll('*'));
			    		while(tree.length > 0){
			    			let branch = tree.pop();
			    			if(this.prefilter(branch) && branch.attributes != null){
			    				let attribStr = this.makeAttrString(branch);
			    				if(runType == 0){
			    					let link = this.hasLinks(attribStr, branch);
			    					if(link && result.links.indexOf(link) == -1) result.links.push(link);
			    				}
			    				
			    			}
			    		}
			    		return result;
					},
					hasLinks : function(inputStr, node){
						if(this.checkLinkWords(inputStr)){
							return this.extractLink(node);
						}
					},
					checkLinkWords : function(strToCheck){
						let checkWords = /log[\-\s]*[io]+n|sign[\-\s]*[io]+n|sign[\-\s]*up|create[\-\s]*account|register|get[\-\s]*started|registration|existing[\-\s]*user|join/gi;
						let eliminationWords = /opinion|javascript|news|track|social|subscribe|connect|like|support|recovery|forgot|help|promo|privacy[\-\s]*policy|sports|story|campaign|questions|store|itunes|play\.google|graph\.facebook|jobs|pdf|doc|jsp|entry|exe|download|newsletter|comment|article|entertainment|competition|meeting|chat/gi;
						if(strToCheck.match(eliminationWords) == null){
							if(strToCheck.match(checkWords) != null){
								return true;
							}
						}
						return false;
					},
					extractLink : function(node){
						var parent = node.parentElement;
		                var val = node.getAttribute('href') || node.getAttribute('onclick') || node.getAttribute('action');
		                if(val && val != '#'){
		                    return val;
		                }else{
		                    if(parent){
		                        var parentVal = parent.getAttribute('href') || parent.getAttribute('onclick') || parent.getAttribute('action');
		                        if(parentVal && parentVal != '#') return parentVal;
		                    }
		                }
		                return null;
					},
					makeAttrString : function(node){
		            	var txt = '';
		            	for (var i = 0; i < node.childNodes.length; ++i)
							if (node.childNodes[i].nodeType === 3)
								txt += node.childNodes[i].textContent;
			    		var str = txt.trim() || '';
		                var attribs = node.attributes;
		                for(var i=0; i < attribs.length; i++){
		                    str += attribs[i].name + "=" + attribs[i].value + ";"
		                }
		                return str;
			    	}
				};
				return fns.processDOM();
			}, runType)
			.end()
			.then(function(result){
				console.log(result)
			})
			.catch(function(){

			});
		});
	}, Promise.resolve([])).then(function(results){
		count++;	//count to keep track of recursion
		runType++;	//type number to distinguish initial run from second run of links found
		console.log("All done run : "+count);
		allResults = allResults.concat(results);
    	if(count == 1) run(links);
    	if(count == 2) write(allResults);
	});
}


// Write or read from file functions
function write(data){
	try{
		fs.appendFile('../../data/'+logFileName+'_log.txt', JSON.stringify(data)+"\n", function(isDone){});
		
		// for(let i = 0; i < data.length; i++){
		// 	let each = data[i];
		// 	fs.appendFile('../data/'+logFileName+'_log.txt', JSON.stringify(each)+"\n", function(isDone){});
		// }
	}catch(e){
		console.log("Write file error : " + e);
	}
}
