const express = require('express');
const cors = require('cors');

const fs = require('fs');

const { textVide } = require('text-vide');

const app = express();
app.use(express.json({ limit: '50mb' }));

app.use(cors());

const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const firebaseConfig = {
  apiKey: 'AIzaSyAKwgJJTj4uktZOZhzYyXwka6370Y_IyYQ',
  authDomain: 'bionic-19405.firebaseapp.com',
  projectId: 'bionic-19405',
  storageBucket: 'bionic-19405.appspot.com',
  messagingSenderId: '548865965414',
  appId: '1:548865965414:web:87ca5d98169e511b0a9ca7',
  measurementId: 'G-KCX1Z76M8D',
};
const firebase = initializeApp(firebaseConfig);
const storage = getStorage(firebase);

const PDFParser = require('./parser/PDFParser');

app.post('/api/bionic', async (req, res) => {

    const pdf = new PDFParser(req.body.url);
	await pdf.init();
	pdf.writeBionicHtml('./bionic.html', {
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
	//upload to firebase in bionic folder and return url
	// const storageRef = ref(storage, 'bionic/bionic.html');
	// const file = await uploadString(storageRef, fs.readFileSync('./bionic.html', 'utf8'));
	// const url = await getDownloadURL(file);
	const fileRef = ref(storage, 'bionic/bionic.html');
	const file = await uploadBytes(fileRef, fs.readFileSync('./bionic.html', 'utf8'));

	res.send(url); 
	// upload to firebase
	// const file = fs.readFileSync('./bionic.html');
	// const storageRef = storage.ref();
	// const fileRef = storageRef.child('bionic/bionic.html');
	// await fileRef.put(file);
	// const url = await fileRef.getDownloadURL();
	// res.send(url);
    // TODO: upload bionic.html (convert to pdf first?) to firebase, res.send url from firebase
});

// create a post route to upload pdf to firebase
app.post('/api/upload', async (req, res) => {
	const file = req.body.file;
	const storageRef = storage.ref();
	const fileRef = storageRef.child('sample.pdf');
	await fileRef.put(file);
	const url = await fileRef.getDownloadURL();
	res.send(url);
});

// 

// create a function to convert html to pdf
// const pdf = require('html-pdf');
// const html = fs.readFileSync('./bionic.html', 'utf8');
// const options = { format: 'Letter' };
// pdf.create(html, options).toFile('./bionic.pdf', function(err, res) {
// 	if (err) return console.log(err);
// 	console.log(res); // { filename: '/app/businesscard.pdf' }
// });

app.listen(process.env.PORT || 3000);