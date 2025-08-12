require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Contact = require('./models/contact')

const app = express()

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

morgan.token('body', (request) => request.method === 'POST' ? JSON.stringify(request.body) : '')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response, next) => {
  Contact.find({}).then(result => {
    response.json(result)
  })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  const requestTime = new Date().toString()
  Contact.find({}).then(result => {
    const html = `<div>
            <p>Phonebook has ${result.length} contacts. Date:</p>
            <p>${requestTime}</p>
        </div>`
    response.send(html)
  })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Contact.findById(request.params.id).then(contact => {
    if (contact)
      response.json(contact)
    else
      response.status(404).json({ error: 'contact not found' })
  })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing'
    })
  }

  Contact.find({}).then(result => {
    if (result.some(r => r.name === body.name))
      return response.status(400).json({
        error: `${body.name} is already added`
      })

    const contact = new Contact({
      name: body.name,
      number: body.number,
    })

    contact.save().then(result => {
      response.json(result)
    })
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { number } = request.body

  Contact.findById(request.params.id)
    .then(contact => {
      if (!contact)
        return response.status(404).end()

      contact.number = number

      return contact.save().then((updatedContact) => {
        response.json(updatedContact)
      }).catch(error => next(error))
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Contact.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`- Server running on port ${PORT}`)
})
