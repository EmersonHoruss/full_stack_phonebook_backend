require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/Person');

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.use(express.static('dist'));
morgan.token('req-body', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body);
  }
  return null;
});
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :req-body', {
    skip: (req) => req.method !== 'POST',
  })
);

app.get('/api/persons', (_, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});
app.get('/api/persons/:id', (request, response, next) => {
  const { id } = request.params;
  Person.find({ _id: id })
    .then((persons) => {
      const existPersons = persons.length;
      if (existPersons) {
        response.json(persons[0]);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});
app.delete('/api/persons/:id', (request, response, next) => {
  const { id } = request.params;
  Person.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});
app.post('/api/persons', async (request, response, next) => {
  const person = request.body;
  if (!person.name) {
    return response.status(400).json({
      error: 'name missing',
    });
  }
  if (!person.number) {
    return response.status(400).json({
      error: 'number missing',
    });
  }
  await Person.find({ number: person.number })
    .then((persons) => {
      const numberAlreadyExist = persons.length;
      if (numberAlreadyExist) {
        return response.status(400).json({
          error: 'number must be unique',
        });
      }
    })
    .catch((error) => next(error));
  await Person.find({ number: person.number })
    .then((persons) => {
      const numberAlreadyExist = persons.length;
      if (numberAlreadyExist) {
        return response.status(400).json({
          error: 'number must be unique',
        });
      }
    })
    .catch((error) => next(error));
  const personToSave = new Person({
    name: person.name,
    number: person.number,
  });
  personToSave
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});
app.put('/api/persons/:id', (request, response, next) => {
  const { body } = request;
  const { id } = request.params;
  const person = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});
app.get('/info', (_, response, next) => {
  Person.find({})
    .then((persons) => {
      response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
        `);
    })
    .catch((error) => next(error));
});
const unknownEndpoint = (_, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);
const errorHandler = (error, _, response, next) => {
  console.error(error.message);
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    const errorMessages = Object.entries(error.errors).map(
      ([field, errorObject]) => `${field}: ${errorObject.message}`
    );
    const errorMessage = errorMessages[0].split(': ')[1];
    return response.status(400).json({ error: errorMessage });
  }
  next(error);
};
app.use(errorHandler);
const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
