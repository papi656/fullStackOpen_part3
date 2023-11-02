require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
// app.use(morgan('tiny'))

morgan.token('text', function getText(req){
    // console.log(req.body)
    const post_text = req.body 
    // console.log(!post_text)
    if(Object.entries(post_text).length === 0) return null
    return JSON.stringify(post_text)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :text'))

const errorHandler = (error, request, response, next) => {
    // console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
    else if(error.name == 'ValidationError'){
        // console.log(error)
        return response.status(400).send({error: 'Name length < 3 or number not in correct format'})
    }
  
    next(error)
  }
  
  // this has to be the last loaded middleware.
app.use(errorHandler)
// let contacts = [
//     { 
//       "id": 1,
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": 2,
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": 3,
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": 4,
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423"
//     }
// ]

// app.get('/', (request, response) =>{
//     response.send('<h3>Go to /api/persons</h3>')
//   })
const Entry = require('./models/contact')

app.get('/api/persons', (request, response) =>{
    Entry.find({}).then(contacts =>{
        response.json(contacts)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Entry.findById(request.params.id)
        .then(contact => {
            if(contact)
                response.json(contact)
            else
                response.status(404).end()
        })
        .catch(error =>{
            next(error)
            // console.log(error)
            // response.status(400).send({error: 'malformatted id'})
            // response.status(400).send({ error: 'malformatted id' })
        })
    // const id = Number(request.params.id)
    // const contact = contacts.find(contact => contact.id === id)
    // if(contact)
    //     response.json(contact)
    // else   
    //     response.status(404).end()
})

app.post('/api/persons', (request, response, next) => {
    // const multiplier = 1000000
    // const rand_id = Math.floor(Math.random() * multiplier)
    const body = request.body
    // console.log(request.method)
    // console.log(body)

    if(!body.name || !body.number){
        return response.status(400).json({
            error: 'The name or number is missing'
        })
    }

    // const isNameRepeated = contacts.reduce((accumulator, currentValue) => accumulator || currentValue.name === body.name, false)
    // if(isNameRepeated){
    //     return response.status(400).json({
    //         error: 'The name already exists in phonebook'
    //     })
    // }

    const contactEntry = new Entry({
        // id: rand_id,
        // id: body.id,
        name: body.name,
        number: body.number,
    })

    contactEntry.save().then(savedContact =>{
        response.json(savedContact)
    })
    .catch(error => next(error))
    // contacts = contacts.concat(contactEntry)

    // response.json(contactEntry)
})

app.put('/api/persons/:id', (request, response, next) => {
    // const id = Number(request.params.id)
    const body = request.body

    const contact = {
        name: body.name,
        number: body.number
    }

    Entry.findByIdAndUpdate(request.params.id, contact, {new: true, runValidators: true, context: 'query'})
        .then(updatedContact => {
            response.json(updatedContact)
        })
        .catch(error => next(error))    
})

// app.delete('/api/persons/:id', (request, response) => {
//     const id = Number(request.params.id)

//     contacts = contacts.filter(contact => contact.id !== id)

//     response.status(204).end()
// })

app.delete('/api/persons/:id', (request, response, next) => {
    Entry.findByIdAndRemove(request.params.id)
        .then(result =>{
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.get('/info', (request, response) => {
    // const num_contacts = contacts.length 
    // let num_contacts = 0
    Entry.find({}).then(contacts =>{
        // console.log(contacts)
        const num_contacts = contacts.length
        const current_time = new Date()

        response.send(`<p>Phonebook has info of ${num_contacts} peoples</p>
                    <p>${current_time}</p>`)
    })
    // const current_time = new Date()

    // response.send(`<p>Phonebook has info of ${num_contacts} peoples</p>
    //                 <p>${current_time}</p>`)
})

const PORT = process.env['PORT'] || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
