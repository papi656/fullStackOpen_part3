require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('dist'));

morgan.token('text', (req) => {
  const postText = req.body;
  if (Object.entries(postText).length === 0) return null;
  return JSON.stringify(postText);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :text'));

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: 'Name length < 3 or number not in correct format' });
  }
  next(error);
  return null;
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const Entry = require('./models/contact');

app.get('/api/persons', (request, response) => {
  Entry.find({}).then((contacts) => {
    response.json(contacts);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Entry.findById(request.params.id)
    .then((contact) => {
      if (contact) { response.json(contact); } else { response.status(404).end(); }
    })
    .catch((error) => {
      next(error);
    });
});

app.post('/api/persons', (request, response, next) => {
  const { body } = request;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'The name or number is missing',
    });
  }

  const contactEntry = new Entry({
    name: body.name,
    number: body.number,
  });

  contactEntry.save().then((savedContact) => {
    response.json(savedContact);
  })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { body } = request;

  const contact = {
    name: body.name,
    number: body.number,
  };

  Entry.findByIdAndUpdate(request.params.id, contact, { new: true, runValidators: true, context: 'query' })
    .then((updatedContact) => {
      response.json(updatedContact);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Entry.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.get('/info', (request, response) => {
  Entry.find({}).then((contacts) => {
    const numContacts = contacts.length;
    const currentTime = new Date();

    response.send(`<p>Phonebook has info of ${numContacts} peoples</p>
                    <p>${currentTime}</p>`);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
