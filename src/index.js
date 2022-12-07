const express = require('express');
const cors = require('cors');

const url = require('url');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));

app.use(cors());

const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const pdfCoApiKey = 'verynyze@gmail.com_71642099ff013c6a9b3bca59e96e4d540ca041f45ca4f78a5f4c7665002f67ef95a0573b';

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

const getBionic = require('./parser/pdfToBionic');

app.post('/api/bionic', async (req, res) => {

    const file = await getBionic(pdfCoApiKey, req.body.url);
	const filename = path.posix.basename(url.parse(req.body.url).pathname);


	const storageRef = ref(storage, `bionic/${filename}`);
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Listening on :${port}`);
});