const fetch = require('node-fetch');

const { textVide } = require('text-vide');
const html2pdf = require('html-pdf-node');

const { htmlToPdf } = require('../converter/bionic');

const pdfToBionicWithApi = async (apiKey, fileUrl) => {
	console.log(`\nConverting from url: ${fileUrl}`);

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
	if(data.error) {
		return data;
	}
	const file = await fetch(data.url);
	const buffer = await file.buffer();

	const [head, body] = buffer.toString().split("</head>");

	const bionicBody = textVide(body);
	const bionicHtml = head.concat(head, "</head>", bionicBody);

	const pdf = await html2pdf.generatePdf({ content: bionicHtml }, { format: 'A4' });
	const html = Buffer.from(bionicHtml, 'utf-8');

	console.log('Conversion successful. Uploading...');
	return { pdf, html };
}

module.exports = pdfToBionicWithApi;