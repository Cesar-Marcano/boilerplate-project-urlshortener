require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns/promises')
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

class Url {
  original_url = undefined;
  short_url = undefined

  constructor(original_url, short_url) {
    this.original_url = original_url
    this.short_url = short_url
  }

  static async create(original_url, short_url) {
    await dns.lookup(original_url)

    return new Url(original_url, short_url)
  }
}

var urls = []

app.post('/api/shorturl', async function(req, res) {
  try {
    const url = req.body.url

    const newUrl = await Url.create(url, urls.length)
    
    res.status(201).json(newUrl);
  } catch (error) {
    res.status(400).json({ error: 'invalid url' })
  }
});

app.get('/api/shorturl/:urlId', function(req, res) {
  const urlId = req.params.urlId

  const url = urls.filter(url => url.short_url === urlId)[0]

  return res.status(301).redirect(url.original_url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
