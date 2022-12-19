# bionic backend

```
npm start
```

## example usage:

```
POST /api/bionic

body:
    url: "https://puersa.com/assets/sample.pdf"
```

Response json:

```json
{
  "url": "https://firebaseUrl/sample.pdf",
  "htmlUrl": "https://firebaseUrl/sample.html"
}
```

## env variables:

(optional)

- `PDFCOAPIKEY` - to override `pdfCoApiKey` (for pdf.co api)
# Bionic-API
