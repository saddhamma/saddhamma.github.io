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

var iframe = $('<iframe id="find-on-page" border=0 frameborder=0 scrolling=no>'),
     find_html = '<style>body > * {float:left}</style><img style="width:24; height:24" src=images/findt.gif><input type=text id=text onFocus=this.value="" style=width:160><button id=next onClick=parent.findOnPage(this)>▼</button><button id=previous onClick=parent.findOnPage(this)>▲</button>';
$('.header').append(iframe)
$(document).ready(function(){
	$(iframe.contents()[0].body).html(find_html)
});

function findOnPage(element) {
	var direction = $(element).attr('id'),
		text = $(element).parent().find('#text').val();
	result = find(text, 0, (direction == 'next') ? 0 : 1)
	if (!result) alert('Sorry .. no match found')
}
