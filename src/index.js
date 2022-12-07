const express = require('express');
const cors = require('cors');

const fs = require('fs');

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
	const file = await pdf.toBionic({
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
	const storageRef = ref(storage, `bionic/${pdf.filename}`);
	uploadBytes(storageRef, file)
		.then((snapshot) => {
			getDownloadURL(snapshot.ref).then((url) => {
				res.status(201).json({ url })
			}).catch((error) => {
				res.sendStatus(500);
			})
		})
		.catch((error) => {
			res.sendStatus(500);
		});
});

app.listen(process.env.PORT || 3000);