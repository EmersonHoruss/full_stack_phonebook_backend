require('dotenv').config()
const express = require('express')
const morgan = require('morgan');
const cors = require('cors')
const app = express()
const Person = require("./models/Person")

app.use(express.json())
app.use(cors())
app.use(morgan('tiny'));
app.use(express.static('dist'))
morgan.token('req-body', (req) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body);
    }
    return null;
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body', {
    skip: (req) => req.method !== 'POST',
}));
let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})
app.post('/api/persons', (request, response) => {
    const person = request.body
    if (!person.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }
    if (!person.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }
    const numberAlreadyExist = persons.find(currentPerson => currentPerson.number === person.number)
    if (numberAlreadyExist) {
        return response.status(400).json({
            error: 'number must be unique'
        })
    }
    person.id = Math.floor(Math.random() * 100000)
    persons = persons.concat(person)
    response.json(person)
})
app.get("/info", (request, response) => {
    response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
    `)
})
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})