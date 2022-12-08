const express = require('express');
const cors = require('cors');

const url = require('url');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));

app.use(cors());

const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const pdfCoApiKey = 'gsenoc@gmail.com_efed6aef4adbf607ae4e9f40de451999273e2926e8249a3b2f70de40e7cd1688f180efd2';

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

	if(!file) {
		res.sendStatus(500); // todo: improve error messages
		return;
	}

	const storageRef = ref(storage, `bionic_files/${filename}`);
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