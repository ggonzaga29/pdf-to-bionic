const PDFParser = require('../parser/PDFParser');

(async () => {
	const pdf = await new PDFParser('https://puersa.com/assets/sample.pdf');
	await pdf.init();
	pdf.writeBionicHtml('./html/bionic.html', {
		css: `
		body {
			font-family: sans-serif;
			font-size: 1.2rem;
			
		}

		.container {
			width: 980px;
			margin: 0 auto;
		}

		p {
			margin: 0;
			line-height: 1.5;
			text-align: justify;
			text-justify: inter-word;
		}
		`,
	});
})();
