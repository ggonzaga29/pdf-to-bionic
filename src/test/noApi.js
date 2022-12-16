const pdfToBionicNoApi = require('../parser/pdfToBionicNoApi');

(async () => {
	const result = await pdfToBionicNoApi(
		'https://puersa.com/assets/sample.pdf'
	);

	console.log("html");
	console.log(result.html);
})();
