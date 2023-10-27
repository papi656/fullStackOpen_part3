const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())
// app.use(morgan('tiny'))

morgan.token('text', function getText(req){
    // console.log(req.body)
    const post_text = req.body 
    // console.log(!post_text)
    if(Object.entries(post_text).length === 0) return null
    return JSON.stringify(post_text)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :text'))

let contacts = [
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
      "number": "39-23-6423"
    }
]

app.get('/', (request, response) =>{
    response.send('<h3>Go to /api/persons</h3>')
  })

app.get('/api/persons', (request, response) =>{
    response.json(contacts)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const contact = contacts.find(contact => contact.id === id)
    if(contact)
        response.json(contact)
    else   
        response.status(404).end()
})

app.post('/api/persons', (request, response) => {
    const multiplier = 1000000
    const rand_id = Math.floor(Math.random() * multiplier)
    const body = request.body

    if(!body.name || !body.number){
        return response.status(400).json({
            error: 'The name or number is missing'
        })
    }

    const isNameRepeated = contacts.reduce((accumulator, currentValue) => accumulator || currentValue.name === body.name, false)
    if(isNameRepeated){
        return response.status(400).json({
            error: 'The name already exists in phonebook'
        })
    }

    const contactEntry = {
        id: rand_id,
        name: body.name,
        number: body.number,
    }

    contacts = contacts.concat(contactEntry)

    response.json(contactEntry)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)

    contacts = contacts.filter(contact => contact.id !== id)

    response.status(204).end()
})

app.get('/info', (request, response) => {
    const num_contacts = contacts.length 
    const current_time = new Date()

    response.send(`<p>Phonebook has info of ${num_contacts} peoples</p>
                    <p>${current_time}</p>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
