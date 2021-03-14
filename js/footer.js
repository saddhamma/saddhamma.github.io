/* This file contains everything which needs to happen at the end of 
 * loading the main contents 
 */

DEBUGGERIZE = false;

if (DEBUGGERIZE) {
 oldBody = $(document.body).clone();
};

findClass = "search-match";
findTargetSelector = "p:visible";
findResultCurrentClass='search-current';
sectionDivSelector = 'hr, hgroup, h1, h2, h3, h4, h5, h6, div.glob';
sectionDivHiddenSelector = 'hr';
paliVisible = localStorage.getItem('paliVisible') == "true" ? true : false;

/*
$('#pali').removeClass('active')
*/
/* When the english and pali are spliced together, elements are grouped
 * and the groups end on one of the below.
 */
spliceCloses = 'p, blockquote, div'
/* A new group should open on these, even if it otherwise wouldn't */
spliceOpens = 'hgroup, h1, h2, h3'

/* This function decides whether a paragraph should be lumped anyway
 * It wont be lumped if:
 * The node type is anything other than 'p' (i.e. div or blockquote)
 * If it is at least 200 characters long.
 * If it contains at least 2 sentence-enders.
 * */
function insignificant(e){
	if (e.nodeName != 'P') return false;
	var text = $(e).text();
	if (text.length < 80) return true;
	if (text.length >= 200) return false;
	var m = text.match(/[.!?:]/g),
		periodCount = m ? m.length : 0;
	
	return (periodCount <= 1)
}

var next_sutta = $('#next-sutta').attr('title', 'Next Sutta'),
 previous_sutta = $('#previous-sutta').attr('title', 'Previous Sutta')

function groupy(collection){
	var out = [],
		group = [];

	for (var i = 0; i < collection.length; i++) {
		var e = collection[i];
		if ($(e).is(spliceOpens) && $(group).is(spliceCloses)) {
			out.push(group);
			group = [];
		}
		group.push(e);
		if ($(e).is(spliceCloses) && !insignificant(e)) {
			out.push(group);
			group = [];
		}
	}
	if (group.length){
		out.push(group);
	}
	return out;
}

/* Splits an array on elements for which splitFn returns true
 * these elements are included in the output (at the start of the
 * new group) unless excludeMatching is true.
 */
function arraySplit(array, splitFn, excludeMatching){
 
 var current = [],
 out = [current],
 carrying = false;
 
 for (i = 0; i < array.length; i++){
 var e = array[i], matches = splitFn(e);
 if (matches){
  if (carrying) {
  current.push(e);
  } else {
  current = [e];
  out.push(current);
  carrying = true;
  }
 } else {
  carrying = false
  current.push(e);
 }
 }
 return out;
}

function td(lang){
 return $('<td lang='+lang+'>');
}

function sum(array){
 var total = 0;
 return array.reduce(function(a,b){return a+b;}, 0);
}

sectionNum = 0;

function extraporlativeSplice(en, pi, table) {
 sectionNum++;
 
 var tr,
 entd,
 pitd;

 function rowReset(){
 tr = $('<tr>');
 entd = td('en').appendTo(tr);
 pitd = td('pi').appendTo(tr);
 table.append(tr);
 }

 if (en.length == 0) {
 rowReset();
 pitd.append(pi);
 return
 }

 if (pi.length == 0) {
 rowReset();
 entd.append(en);
 return
 }

 function textLength(){
 var node = $(this).clone();
 node.find('.note').remove();
 if ($(node).is(sectionDivSelector)) {
  return 0.01;
 }
 return node.text().length;
 }

 var enLengths = $(en).map(textLength).toArray(),
 piLengths = $(pi).map(textLength).toArray(),
 enRemains = sum(enLengths),
 piRemains = sum(piLengths),
 overallRatio = 1;
 enIndex = 0,
 piIndex = 0;

 function calculateOverallRatio(){
 return sum(enLengths.slice(enIndex)) / sum(piLengths.slice(piIndex));
 }

 function calculateRatio(ex, px){
 return sum(ex.map(function(i){return enLengths[i]})) / (sum(px.map(function(i){return piLengths[i]})) * overallRatio);
 }

 function quality(v){
 if (v > 1) return 1 / v;
 else return v;
 } 

 var enStack,
 piStack;
 function stackReset(){
 enStack = []
 piStack = []
 }

 /* This is the meat of the function, it pairs up paragraphs trying
 * to equalize paragraph length. It advances to a new pairing, when it
 * can no longer improve the quality by adding additional paragraphs
 * on either side.
 */
 while (true) {
 var enDone = enIndex >= en.length,
  piDone = piIndex >= pi.length;
 if (enDone || piDone){
  if (enDone) {
  pitd.append(pi.slice(piIndex));
  }
  else if (piDone) {
  entd.append(en.slice(enIndex));
  }
  break
 }
 
 overallRatio = calculateOverallRatio();
 if (DEBUGGERIZE){
  console.log('The overall ratio is '+overallRatio);
 }
 stackReset();
 rowReset();
 while ($(enStack[enIndex]).is(sectionDivSelector)) {
  enStack.push(enIndex);
  enIndex ++;
 }
 while ($(piStack[piIndex]).is(sectionDivSelector)) {
  piStack.push(piIndex);
  piIndex ++;
 }

 enStack.push(enIndex);
 enIndex ++;
 
 piStack.push(piIndex);
 piIndex ++;
 
 var ratio = calculateRatio(enStack, piStack);
 var bestQuality = quality(ratio);

 // While the english paragraph is longer
 while (ratio > 1) {
  var e = pi[piIndex];
  if ($(e).is(sectionDivSelector)) {
  //If we have hit a section divider we can't
  //continue.
  break;
  }
  
  piStack.push(piIndex);
  piIndex ++;
  ratio = calculateRatio(enStack, piStack);
  newQuality = quality(ratio);
  if (newQuality < bestQuality) {
  piStack.pop();
  piIndex --;
  break
  } else {
  bestQuality = newQuality;
  }
 }

 // While the pali paragraph is longer
 while (ratio < 1) {
  var e = en[enIndex];
  if ($(e).is(sectionDivSelector)) {
  break;
  }
  enStack.push(enIndex);
  enIndex ++;
  ratio = calculateRatio(enStack, piStack);
  newQuality = quality(ratio);
  if (newQuality < bestQuality) {
  enStack.pop();
  enIndex --;
  break
  } else {
  bestQuality = newQuality;
  }
 }

 // The row cannot be improved by adding a paragraph from either side
 entd.append(enStack.map(function(i){return en[i]}));
 pitd.append(piStack.map(function(i){return pi[i]}));
 }
 
 return
}

function splice(en, pi, table){
 if (pi.length == 0 && en.length == 0) {
 return;
 }

 // Group into td's
 var en_tds = groupy(en).map(function(g){
  return $('<td lang=en>').append(g);
 }),
 pi_tds = groupy(pi).map(function(g){
  return $('<td lang=pi>').append(g);
 }),
 i = 0;
 
 while (true) {
 var tr = $('<tr>'),
  en = en_tds.shift(),
  pi = pi_tds.shift();

 if (!en && !pi) {
  break;
 }

 tr.append([en, pi]);
 table.append(tr);
 }
}

function groupAdjacent(elements, wrapper, wrapall){
 groups = [];
 group = [];
 last = null;
 for (var i = 0; i < elements.length; i++) {
 var e = elements[i];
 if (last != null) {
  if ($(e).prev()[0] == last) {
  group.push(e);
  } else {
  group = [e];
  groups.push(group);
  }
 }
 last = e;
 }
 groups.forEach(function(group){
 if (!wrapall && group.length <= 1) return;

 var wrap = $(wrapper);
 $(group[0]).replaceWith(wrap);
 wrap.append(group);
 
 })
}

function alignedSplicer(section, table, selector){
 if (!selector) selector = 'hr';

 // Group section dividers
 
 groupAdjacent(
 section.find('div[lang=pi], div[lang=en]').children(sectionDivSelector),
 '<div class=glob>')
 
 var pi = section.find('div[lang=pi] > *');
 var en = section.find('div[lang=en] > *');

 en.filter(sectionDivHiddenSelector).show();
 pi.filter(sectionDivHiddenSelector).show();
 

 var splitFn = function(e) {
 return $(e).is(selector);
 }
 pies = arraySplit(pi, splitFn);
 ensies = arraySplit(en, splitFn);
 var msg = 'There are '+ensies.length+' divisions of english texts and '+pies.length+' divisions of pali texts.';
 if (DEBUGGERIZE){
 console.log(msg)
 }
 if (pies.length != ensies.length) {
 
 /*pies = [pi.toArray()];
 ensies = [en.toArray()];*/
 }
 var end = Math.max(pies.length, ensies.length);
 for (var i = 0; i < end; i++) {
 extraporlativeSplice(ensies[i] || [], pies[i] || [], table);
 }
}

/****** SPLICER ******/
$(document).ready(function(){
 if ($('.raw_sutta').length == 0){
 return;
 }
 var table = $('<table class="pairs">');
 $('.raw_sutta').each(function(){
 alignedSplicer($(this), table, sectionDivSelector);
 });
 table.find('td[lang=pi]').hide()
 
 $('#content').append(table)
 /* Set an appropriate caption */
 var h1 = $('h1').first();
 // h1.prepend(previous_sutta);
 // h1.append(next_sutta);
 var caption = $('<caption>').append(h1);
 table.prepend(caption)

 $('tr').each(function(){
 

 });
 
 // On load retrieve the state of pali visibility from localStorage
 // which defaults to null (falsely) if it's never been set.
 setPaliVisibility(paliVisible);
});

url_components = /.*\/([\w.]+)\/([\w.-]+)\.html/.exec(location.href);
division = url_components[1];

if ($('.raw_sutta div[lang=pi] > *').length == 0) {
 $('#pali').remove();
}

function loadPaliLookup(){
 if ($('.lookup').length == 0) {
 jQuery.ajax({
  url: '../js/pali-lookup-standalone.js', 
  dataType: "script",
  success: function(){enablePaliLookup()},
  crossDomain:true});
 }
}

function setPaliVisibility(state) {
 if (state) {
 $('td:nth-child(2)').show();
		$('#pali').addClass('active');
 loadPaliLookup();
		
 } else {
 $('td:nth-child(2)').hide();
		$('#pali').removeClass('active')
 }
}

$('#pali').on('click', function(){
 paliVisible = !paliVisible;
 localStorage.setItem('paliVisible', paliVisible);
 setPaliVisibility(paliVisible);
})

$('li.nextprev').append(previous_sutta).append(next_sutta)

var adjustedfontsize = 100;
$('#size_plus').on('click', function(){
 adjustedfontsize *= 1.2;
 $('#size_minus').removeAttr('disabled');
 fontresize(adjustedfontsize);
});
$('#size_minus').on('click', function(){
 adjustedfontsize /= 1.2;
 fontresize(adjustedfontsize);
 if (adjustedfontsize < 60)
 $(this).attr('disabled', 'disabled');
});

function fontresize(newsize) {
 $('p').attr('style', 'font-size: ' + newsize + '%');
	 }

// removed '/' (newline) between the up- and down-arrows 

var find_box = $('<div id="find-on-page">');
find_box.html('<img src=../images/find.gif>\
<input type=text id=find_string>\
<button id=next>▼</button><button id=previous>▲</button>');

 $('header').append(find_box)

function cleanUnwrap(i, e){
	try {
		var text_node = e.firstChild;
		e.parentNode.replaceChild(text_node, e);
		var prev = text_node.previousSibling,
			next = text_node.nextSibling;
		if (prev && prev.nodeType == document.TEXT_NODE){
			prev.data += text_node.data;
			text_node.parentNode.removeChild(text_node);
			text_node = prev;
		}
		if (next && next.nodeType == document.TEXT_NODE){
			text_node.data += next.data;
			text_node.parentNode.removeChild(next);
		}
	} catch (exception) {
		e.outerHTML = e.innerHTML;
	}
}

var findOnPage = {
	place: null,
	findAll: function(string) {
		var self = findOnPage,
			targets = null;
		if (string.length < 3) return;
		self.running = true;
		self.clear();
			
		string = string.replace(/a/gi, '[aā]')
					 .replace(/i/gi, '[iī]')
					 .replace(/u/gi, '[uū]')
					 .replace(/m/gi, '[mṁṁ]')
					 .replace(/n/gi, '[nṇṅñṁṁ]')
					 .replace(/t/gi, '[tṭ]')
					 .replace(/d/gi, '[dḍ]')
					 .replace(/l/gi, '[lḷ]')
		self.rex = RegExp(string, 'gi');
			
		targets = $(findTargetSelector);
		
		for (var i = 0; i < targets.length; i++){
			self.findInElement(targets[i]);
		}

		self.running = false;
		self.matches = $('.'+findClass);
		self.next();
		if (self.request_run){
			self.findAll(self.request_run);
		}
	},
	findInElement: function(e){
		var self = findOnPage;
		var contents = $(e).contents();
		for (var i = 0; i < contents.length; i++){
			var item = contents[i];
			if (item.nodeType == document.TEXT_NODE){
				// Do stuff
				var text = item.data,
					result = text.replace(self.rex, function(m){
						return '<span class="'+findClass+'">' + m + '</span>';
					});
				if (result != text) {
					var proxy = $('<span>')[0];
					item.parentNode.replaceChild(proxy, item);
					proxy.outerHTML = result;
				}
			} else if (item.nodeType == document.ELEMENT_NODE) {
				// Recurse!
				findOnPage.findInElement(item);
			}
		}
	},
	next: function(){
		var self = findOnPage;
		self.place++;
		self.updateCurrent();
	},
	previous: function(){
		var self = findOnPage;
		self.place--;
		self.updateCurrent();
	},
	updateCurrent: function(){
		var self = findOnPage;
		$('.'+findResultCurrentClass).removeClass(findResultCurrentClass);
		if (self.place <= 0) {
			$('#previous').attr('disabled', 'disabled');
			self.place = 0;
		} else {
			$('#previous').removeAttr('disabled');
		}
			
		if (self.place >= self.matches.length - 1) {
			$('#next').attr('disabled', 'disabled');
			self.place = self.matches.length - 1;
		} else {
			$('#next').removeAttr('disabled');
		}
		if (self.matches.length){
			var e = $(self.matches[self.place]).addClass(findResultCurrentClass),
				target = e.parents('p');
			if (target.length == 0) target = e;
			if (target[0].scrollIntoViewIfNeeded) {
				target[0].scrollIntoViewIfNeeded()
			} else {
				target[0].scrollIntoView();
			}
		}
	},
	clear: function(){
		var self = findOnPage;
		self.request_run = false;
		$('span.search-match').each(cleanUnwrap);
		self.place = -1;
		self.matches = [];
		self.updateCurrent();
		
	},
	find: function(string){
		var self=findOnPage;
		if (self.last == string) return;
		self.last = string;
		if (string.length <= 1) {
			self.clear();
			return;
		}
		if (self.running){
			if (self.request_run){
				console.log(self.request_run + ' <- Not Searched');
			}
			self.request_run = string
			return;
		} else {
			self.findAll(string);
		}
	},
	repeat: function(){
		var self = findOnPage;
		self.findAll(self.last);
	},
	init: function(){
		var self = findOnPage;
		
		$('#find_string').on('focus', function(){
				this.value = "";
				self.clear();
			 }).on('keyup mouseup change mousemove', function(){
				 var string = this.value;
				 setTimeout(function(){
					self.find(string);}, 5);
			 });
		$('#next').on('click', function(){
			self.next();
		}).attr('disabled', 'disabled');
		$('#previous').on('click', function(){
			self.previous();
		}).attr('disabled', 'disabled');
		self.clear();
	}
}

findOnPage.init();
