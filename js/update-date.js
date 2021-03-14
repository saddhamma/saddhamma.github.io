// in bash file:
// date +$d%h\ %d\ %Y\ $T%H:%m > bw-b/js/date 

function getdate() {
	const fs = require('fs') 
	fs.readFile('../js/date', 'utf-8', (err, data) => { 
		if (err) throw err; 
	}) 
}
alert ("in update");

