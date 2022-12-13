const express = require('express');
const cors = require('cors');

const url = require('url');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));

app.use(cors());
const { initializeApp } = require('firebase/app');
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require('firebase/storage');

const pdfCoApiKey = process.env.PDFCOAPIKEY || 
  'tetannuz@gmail.com_06afec6ab72c8477278a19818d03fba37fa02057fc86e1234d6904363699f7e442e83b5a';

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
  try {
    const files = await getBionic(pdfCoApiKey, req.body.url);
    const filename = path.posix.basename(url.parse(req.body.url).pathname, ".pdf");

    if (files.error) {
      const status = typeof file.status !== 'number' ? file.errorCode : file.status;
      res.status(status).json(file);
      return;
    }

    const pdfRef = ref(storage, `bionic_files/${filename}.pdf`);
    const pdfSnapshot = await uploadBytes(pdfRef, files.pdf);
    const pdfUrl = await getDownloadURL(pdfSnapshot.ref);

    const htmlRef = ref(storage, `bionic_files/${filename}.html`);
    const htmlSnapshot = await uploadBytes(htmlRef, files.html);
    const htmlUrl = await getDownloadURL(htmlSnapshot.ref);

    console.log('Uploaded.');

    res.status(201).json({ url: pdfUrl, htmlUrl });
 
  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      error: true,
      message: 'Error occurred while converting or uploading. Please view server logs for more details.'
    });
  }

});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Listening on :${port}`);
});

