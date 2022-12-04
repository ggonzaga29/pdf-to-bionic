const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const { textVide } = require('text-vide');

/**
 * @param {string} path
 * @desc Parses a PDF file and returns an object with the parsed data
 * @returns {Promise<object>}
 * @see https://www.npmjs.com/package/pdf-parse
 */

class PDFParser {
	constructor(pdfPath) {
		if (typeof pdfPath === 'undefined') {
			throw new Error('PDFParser: No PDF file path specified.');
		}

		this.pdfPath = path.join(__dirname, pdfPath);
		this.text = '';
		this.numpages = 0;
		this.info = '';
		this.numrender = 0;
		this.metadata = '';
		this.version = '';
	}

	async init() {
		let dataBuffer = fs.readFileSync(this.pdfPath);

		const result = await pdf(dataBuffer);
		// number of pages
		this.numpages = result.numpages;
		// number of rendered pages
		this.numrender = result.numrender;
		// PDF info
		this.info = result.info;
		// PDF metadata
		this.metadata = result.metadata;
		// PDF.js version
		this.version = result.version;
		// PDF text
		this.text = result.text;
	}

	writeBionicHtml(writePath = './bionic.html', options = {}) {
		if(!options.css || typeof options.css !== 'string') {
			options.css = '';
		} else {
			options.css = `<style>${options.css}</style>`;
		}


		const textVideResult = textVide(this.text);
		const bionicHTML = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Bionic PDF</title>
			${options.css ? options.css : ''} 
		</head>
		<body>
			<div class="container">
				<p class="bionic-text">
				${textVideResult}
				</p>
			</div>
		</body>
		</html>`;

		fs.writeFileSync(writePath, bionicHTML);
	}

}

module.exports = PDFParser;
