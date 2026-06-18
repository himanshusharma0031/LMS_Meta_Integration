const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()


app.use(cors({
  origin:'https://lms-project-livid.vercel.app/'
}))
app.use(express.json())


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('DB Error:', err))


app.get('/', (req, res) => {
  res.json({ message: 'LMS Server is running!' })
})


app.use('/api/leads', require('./routes/leads'))
app.use('/webhook', require('./routes/webhook'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})