const express = require('express');
const cors = require('cors');

const fs = require('fs');

const { textVide } = require('text-vide');

const app = express();
app.use(express.json({ limit: '50mb' }));

app.use(cors());

const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

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

const pdfToHtml = require('./pdfToHtml.js');

app.post('/api/bionic', async (req, res) => {

    console.log(req.body.url);

    const url = req.body.url;

    await pdfToHtml(url);
    // TODO: wait for pdfToHtml to finish before reading file
    const content = fs.readFileSync('./result.html', (err) => {
        if(err) {
           console.log(err);
        }
    });

    const [head, body] = content.toString().split("</head>");

    const bionicBody = textVide(body);
    const result = head.concat(bionicBody);

    fs.writeFileSync("bionic.html", result, (err) => {
        if(err) {
           console.log(err);
        }
    });
    // TODO: upload bionic.html to firebase, res.send url from firebase
});

app.listen(process.env.PORT || 3000);