const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (request) => request.method === 'POST' ? JSON.stringify(request.body) : '')

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let contacts = [
    {
      "id": "1",
      "name": "Arto Hellas",
      "number": "040-1234567"
    },
    {
      "id": "2",
      "name": "Ada Lovelace",
      "number": "39-44-5323523"
    },
    {
      "id": "3",
      "name": "Dan Abramov",
      "number": "12-43-234345"
    },
    {
      "id": "4",
      "name": "Mary Poppendieck",
      "number": "0123215z"
    }
]

const generateId = () => String(Math.floor(Math.random() * 1000000))

app.get('/api/persons', (request, response) => {
    response.json(contacts)
})

app.get('/info', (request, response) => {
    const requestTime = new Date().toString();
    const html = `<div>
        <p>Phonebook has ${contacts.length} contacts. Date:</p>
        <p>${requestTime}</p>
    </div>`
    response.send(html)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const contact = contacts.find(c => c.id === id)
    if (contact)
        response.json(contact)
    else 
        response.status(404).json({ error: 'contact not found' })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    contacts = contacts.filter(c => c.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ 
            error: 'name or number is missing' 
        })
    }
    if (contacts.some(c => c.name === body.name)) {
        return response.status(400).json({ 
            error: 'name must be unique' 
        })
    }

    const contact = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }
    contacts.push(contact)

    response.json(contact)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})