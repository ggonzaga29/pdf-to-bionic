const pdfToHtml = async () => {
	const https = require('https');
	const path = require('path');
	const fs = require('fs');

	const request = require('request');

	const API_KEY =
		'giangonzaga29@gmail.com_c2f2287eb2734703617b790887b046d7ebef83c29cc4b60342e9b0329202dcf05ae80810';

	// Source PDF file
	const SourceFile = '../_data/example.pdf';
	// Comma-separated list of page indices (or ranges) to process. Leave empty for all pages. Example: '0,2-5,7-'.
	const Pages = '';
	// PDF document password. Leave empty for unprotected documents.
	const Password = '';
	// Destination HTML file name
	const DestinationFile = './result.html';
	// Set to `true` to get simplified HTML without CSS. Default is the rich HTML keeping the document design.
	const PlainHtml = true;
	// Set to `true` if your document has the column layout like a newspaper.
	const ColumnLayout = false;

	getPresignedUrl(API_KEY, SourceFile)
		.then(([uploadUrl, uploadedFileUrl]) => {
			uploadFile(API_KEY, SourceFile, uploadUrl)
				.then(() => {
					convertPdfToHtml(
						API_KEY,
						uploadedFileUrl,
						Password,
						Pages,
						PlainHtml,
						ColumnLayout,
						DestinationFile
					);
				})
				.catch((e) => {
					console.log(e);
				});
		})
		.catch((e) => {
			console.log(e);
		});

	function getPresignedUrl(apiKey, localFile) {
		return new Promise((resolve) => {
			let queryPath = `/v1/file/upload/get-presigned-url?contenttype=application/octet-stream&name=${path.basename(
				SourceFile
			)}`;
			let reqOptions = {
				host: 'api.pdf.co',
				path: encodeURI(queryPath),
				headers: { 'x-api-key': API_KEY },
			};
			https
				.get(reqOptions, (response) => {
					response.on('data', (d) => {
						let data = JSON.parse(d);
						if (data.error == false) {
							resolve([data.presignedUrl, data.url]);
						} else {
							console.log('getPresignedUrl(): ' + data.message);
						}
					});
				})
				.on('error', (e) => {
					console.log('getPresignedUrl(): ' + e);
				});
		});
	}

	function uploadFile(apiKey, localFile, uploadUrl) {
		return new Promise((resolve) => {
			fs.readFile(SourceFile, (err, data) => {
				request(
					{
						method: 'PUT',
						url: uploadUrl,
						body: data,
						headers: {
							'Content-Type': 'application/octet-stream',
						},
					},
					(err, res, body) => {
						if (!err) {
							resolve();
						} else {
							console.log('uploadFile() request error: ' + e);
						}
					}
				);
			});
		});
	}

	function convertPdfToHtml(
		apiKey,
		uploadedFileUrl,
		password,
		pages,
		plainHtml,
		columnLayout,
		destinationFile
	) {
		var queryPath = `/v1/pdf/convert/to/html`;

		var jsonPayload = JSON.stringify({
			name: path.basename(destinationFile),
			password: password,
			pages: pages,
			simple: plainHtml,
			columns: columnLayout,
			url: uploadedFileUrl,
			async: true,
		});

		var reqOptions = {
			host: 'api.pdf.co',
			method: 'POST',
			path: queryPath,
			headers: {
				'x-api-key': apiKey,
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(jsonPayload, 'utf8'),
			},
		};
		var postRequest = https
			.request(reqOptions, (response) => {
				response.on('data', (d) => {
					response.setEncoding('utf8');

					let data = JSON.parse(d);
					console.log(`Job #${data.jobId} has been created!`);

					if (data.error == false) {
						checkIfJobIsCompleted(
							data.jobId,
							data.url,
							destinationFile
						);
					} else {
						console.log('convertPdfToHtml(): ' + data.message);
					}
				});
			})
			.on('error', (e) => {
				console.log('convertPdfToHtml(): ' + e);
			});

		postRequest.write(jsonPayload);
		postRequest.end();
	}

	function checkIfJobIsCompleted(
		jobId,
		resultFileUrl,
		destinationFile
	) {
		let queryPath = `/v1/job/check`;

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

		var postRequest = https.request(reqOptions, (response) => {
			response.on('data', (d) => {
				response.setEncoding('utf8');

				let data = JSON.parse(d);
				console.log(
					`Checking Job #${jobId}, Status: ${
						data.status
					}, Time: ${new Date().toLocaleString()}`
				);

				if (data.status == 'working') {
					setTimeout(function () {
						checkIfJobIsCompleted(
							jobId,
							resultFileUrl,
							destinationFile
						);
					}, 3000);
				} else if (data.status == 'success') {
					var file = fs.createWriteStream(destinationFile);
					https.get(resultFileUrl, (response2) => {
						response2.pipe(file).on('close', () => {
							console.log(
								`Generated HTML file saved as "${destinationFile}" file.`
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

		postRequest.write(jsonPayload);
		postRequest.end();
	}
};
