const https = require('https');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

async function pdfToHtml(url) {
	// The authentication key (API Key).
	// Get your own by registering at https://app.pdf.co
	const API_KEY =
		process.env.API_KEY || "verynyze@gmail.com_7af6760b32ae35f5c68762bd0798f6d332ba66d203d60f08112cbb9c5ad47fefc3b13bcb";

	// Direct URL of source PDF file.
	const SourceFileUrl = url || '';
	// Comma-separated list of page indices (or ranges) to process. Leave empty for all pages. Example: '0,2-5,7-'.
	const Pages = '';
	// PDF document password. Leave empty for unprotected documents.
	const Password = '';
	// Destination HTML file name
	const DestinationFile = './result.html';
	// Set to `true` to get simplified HTML without CSS. Default is the rich HTML keeping the document design.
	const PlainHtml = false;
	// Set to `true` if your document has the column layout like a newspaper.
	const ColumnLayout = false;

	// Prepare request to `PDF To HTML` API endpoint
	var queryPath = `/v1/pdf/convert/to/html`;

	// JSON payload for api request
	var jsonPayload = JSON.stringify({
		name: path.basename(DestinationFile),
		password: Password,
		pages: Pages,
		simple: PlainHtml,
		columns: ColumnLayout,
		url: SourceFileUrl,
		async: true,
	});

	var reqOptions = {
		host: 'api.pdf.co',
		method: 'POST',
		path: queryPath,
		headers: {
			'x-api-key': API_KEY,
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(jsonPayload, 'utf8'),
		},
	};
	// Send request
	var postRequest = https
		.request(reqOptions, (response) => {
			response.on('data', (d) => {
				// Parse JSON response
				var data = JSON.parse(d);
				if (data.error == false) {
					console.log(`Job #${data.jobId} has been created!`);

					// Process returned job
					checkIfJobIsCompleted(data.jobId, data.url);
				} else {
					// Service reported error
					console.log(data.message);
				}
			});
		})
		.on('error', (e) => {
			// Request error
			console.log(e);
		});

	function checkIfJobIsCompleted(jobId, resultFileUrl) {
		let queryPath = `/v1/job/check`;

		// JSON payload for api request
		let jsonPayload = JSON.stringify({
			jobid: jobId,
		});

		let reqOptions = {
			host: 'api.pdf.co',
			path: queryPath,
			method: 'POST',
			headers: {
				'x-api-key': API_KEY,
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(jsonPayload, 'utf8'),
			},
		};

		// Send request
		var postRequest = https.request(reqOptions, (response) => {
			response.on('data', (d) => {
				response.setEncoding('utf8');

				// Parse JSON response
				let data = JSON.parse(d);
				console.log(
					`Checking Job #${jobId}, Status: ${
						data.status
					}, Time: ${new Date().toLocaleString()}`
				);

				if (data.status == 'working') {
					// Check again after 3 seconds
					setTimeout(function () {
						checkIfJobIsCompleted(jobId, resultFileUrl);
					}, 3000);
				} else if (data.status == 'success') {
					// Download HTML file
					var file = fs.createWriteStream(DestinationFile);
					https.get(resultFileUrl, (response2) => {
						response2.pipe(file).on('close', () => {
							console.log(
								`Generated HTML file saved as "${DestinationFile}" file.`
							);
						});
					});
				} else {
					console.log(
						`Operation ended with status: "${data.status}".`
					);
				}
			});
		});

		// Write request data
		postRequest.write(jsonPayload);
		postRequest.end();
	}

	// Write request data
	postRequest.write(jsonPayload);
	postRequest.end();
}

module.exports = pdfToHtml;