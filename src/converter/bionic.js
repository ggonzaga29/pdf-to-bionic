const { textVide } = require('text-vide');
const html2pdf = require('html-pdf-node');

/**
 * Convert text to bionic
 * @param {*} text buffer or string
 * @param {*} format pdf format (A4, A3, etc)
 * @returns {Promise<Buffer>}	Buffer of pdf file and html file
 */

const toBionic = async (text, format = 'A4') => {
	text = text.toString();

	const bionicHtml = `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Bionic HTML</title>

	</head>
	<body>
		<div class="container">
			<p class="bionic-text">
			${textVide(text)}
			</p>
		</div>
	</body>
	</html>`;

	// const bionicBody = textVide(body);
	// const bionicHtml = head.concat(head, '</head>', bionicBody);

	const pdf = await html2pdf.generatePdf(
		{ content: bionicHtml },
		{ format }
	);



	return { pdf, html: Buffer.from(bionicHtml, 'utf-8') };
};

/**
 *
 * @param {*} text buffer or string
 * @param {*} options { format: pdf format (A4, A3, etc), path: path to save pdf }
 * @returns {Promise<void>} void
 */

// TODO: write to file
const writeToBionic = async (html, options) => {};

module.exports = {
	toBionic,
	writeToBionic,
};
