const fetch = require('node-fetch');

const { textVide } = require('text-vide');
const html2pdf = require('html-pdf-node');


const getBionic = async (apiKey, fileUrl) => {
	console.log(`\nConverting from url: ${fileUrl}\n`);

	const params = new URLSearchParams();
	params.append('name', 'bionic.html');
	params.append('url', fileUrl);
	
	const res = await fetch(`https://api.pdf.co/v1/pdf/convert/to/html?${params.toString()}`, {
		method: 'POST',
		headers: {
			"x-api-key": apiKey,
			"Content-Type": "application/json"
		}
	});
	const data = await res.json();
	if(data.error != false) {
		console.log(data.message);
		return;
	}
	const file = await fetch(data.url);
	const buffer = await file.buffer();
	
	const [head, body] = buffer.toString().split("</head>");

	const bionicBody = textVide(body);
	const bionicHtml = head.concat(head, "</head>", bionicBody);
	return await html2pdf.generatePdf({ content: bionicHtml }, { format: 'A4' });
}

module.exports = getBionic;