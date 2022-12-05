const fs = require('fs');
const path = require('path');

const pdf = require('pdf-parse');
const fetch = require('node-fetch');
const { textVide } = require('text-vide');

/**
 * @param {string} path to file or url
 * @desc Parses a PDF file and returns an object with the parsed data
 * @returns {Promise<object>}
 * @see https://www.npmjs.com/package/pdf-parse
 */

class PDFParser {
	constructor(pdfPath) {
		if (typeof pdfPath === 'undefined') {
			throw new Error('PDFParser: No PDF file path specified.');
		}

		// check if file is a url or a path
		if (pdfPath.startsWith('http')) {
			this.url = pdfPath;
		} else {
			this.path = path.join(__dirname, pdfPath);
		}

		this.text = '';
		this.numpages = 0;
		this.info = '';
		this.numrender = 0;
		this.metadata = '';
		this.version = '';
	}

	async init() {
		// if file is a url download file else read file
		let result = null;
		if (this.url) {
			console.log(
				'PDFParser: URL Detected - Downloading PDF file...'
			);
			const response = await fetch(this.url);
			const buffer = await response.buffer();
			result = await pdf(buffer);
		} else {
			console.log('PDFParser: Reading PDF file...');
			const dataBuffer = fs.readFileSync(this.path);
			result = await pdf(dataBuffer);
		}

		// const result = await pdf(dataBuffer);
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
		// bionic html
		this.bionicHtmlString = textVide(this.text);
	}

	writeBionicHtml(writePath = './bionic.html', options = {}) {
		if (!options.css || typeof options.css !== 'string') {
			options.css = '';
		} else {
			options.css = `<style>${options.css}</style>`;
		}

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
				${this.bionicHtmlString}
				</p>
			</div>
		</body>
		</html>`;

		fs.writeFile(writePath, bionicHTML, (err) => {
			if (err) {
				throw new Error(err);
			}

			console.log(
				`PDFParser: Bionic HTML file written to ${writePath}`
			);
		});
	}

	htmlToPdf(htmlPath, writePath) {

	}
}

module.exports = PDFParser;
