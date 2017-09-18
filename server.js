const { config } = require('dotenv')
const express = require('express')
const { isWebUri } = require('valid-url')
const { generate } = require('shortid')

config()

const connect = require('./db')
const app = express()

app.use(express.static('public'))

app.post('/new/*', (req, res) => {
  const url = req.params[0]

  if (!isWebUri(url)) {
    return res.send('Your link is invalid.')
  }

  connect.then(db => {
    const collection = db.collection('links')

    collection
      .find({ url })
      .toArray()
      .then(results => {
        if (results.length > 0) {
          return res.send(results[0])
        }

        collection.insert({
          id: generate(),
          url
        }).then(result => res.send(result.ops[0]))
      })
      .catch(console.error)
  })
})

app.get('/:id', (req, res) => {
  connect.then(db => {
    db.collection('links')
      .find({ id: req.params.id })
      .toArray()
      .then(results => {
        let endpoint = '/'

        if (results.length > 0) {
          endpoint = results[0].url
        }

        return res.redirect(endpoint)
      })
      .catch(console.error)
  })
})

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
