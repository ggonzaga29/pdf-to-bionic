const fs = require('fs');
const url = require('url');
const path = require('path');

const pdf = require('pdf-parse');
const fetch = require('node-fetch');
const { textVide } = require('text-vide');
const html2pdf = require('html-pdf-node');

const { toBionic } = require('../converter/bionic');

const pdfToBionicNoApi = async (fileUrl) => {
	if (typeof fileUrl === 'undefined') {
		throw new Error('PDFParser: No file path specified.');
	}

	let online = false;
	let filePath = '';
	let result = null;

	// check if file is a url or a path
	if (fileUrl.startsWith('http')) {
		online = true;
	} else {
		filePath = path.join(__dirname, pdfPath);
	}

	if (online) {
		try {
			console.log(
				`PDFParser: URL Detected - Downloading PDF file from: ${fileUrl}`
			);
			const response = await fetch(fileUrl);
			const buffer = await response.buffer();
			result = await pdf(buffer);
		} catch (error) {
			console.log(error);
			throw new Error(
				'PDFParser: Error downloading PDF file. Check URL \n' + error
			);
		}
	} else {
		try {
			console.log('PDFParser: Reading PDF file...');
			const dataBuffer = fs.readFileSync(filePath);
			result = await pdf(dataBuffer);
		} catch (error) {
			throw new Error('PDFParser: Error reading PDF file \n' + error);
		}
	}

	if(result) {
		const { text } = result;
		const bionic = toBionic(text);
		return bionic;
	} else {
		throw new Error('PDFParser: Error parsing PDF file');
	}

};

module.exports = pdfToBionicNoApi;
