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
app.get('/api/persons', (request, response, next) => {
    Person
        .find({})
        .then(persons => {
            response.json(persons)
        })
        .catch(error => next(error))
})
app.get('/api/persons/:id', (request, response, next) => {
    const _id = request.params.id
    Person
        .find({ _id })
        .then(persons => {
            const existPersons = persons.length
            if (existPersons) {
                response.json(persons[0])
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})
app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person
        .findByIdAndDelete(id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})
app.post('/api/persons', async (request, response, next) => {
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
    await Person
        .find({ number: person.number })
        .then(persons => {
            const numberAlreadyExist = persons.length
            if (numberAlreadyExist) {
                return response.status(400).json({
                    error: 'number must be unique'
                })
            }
        })
        .catch(error => next(error))
    await Person
        .find({ number: person.number })
        .then(persons => {
            const numberAlreadyExist = persons.length
            if (numberAlreadyExist) {
                return response.status(400).json({
                    error: 'number must be unique'
                })
            }
        })
        .catch(error => next(error))
    const personToSave = new Person({
        name: person.name,
        number: person.number
    })
    personToSave
        .save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const id = request.params.id
    const person = {
        name: body.name,
        number: body.number,
    }
    Person.findByIdAndUpdate(id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})
app.get("/info", (request, response) => {
    Person
        .find({})
        .then(persons => {
            response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
        `)
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
    }
    next(error)
}
app.use(errorHandler)
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})