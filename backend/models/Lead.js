const mongoose = require('mongoose')

const leadSchema = new mongoose.Schema({
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  service: {
    type: String,
    default: 'Not specified'
  },
  sourceDetail: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    enum: ['website', 'meta', 'google'],
    required: true
  },
  campaign: {
    type: String,
    default: ''
  },
  metaLeadId: {
    type: String,
    unique: true,
    sparse: true
  },
  adgroupId: {
    type: String,
    default: ''
  },
  metaCreatedTime: {
    type: Number,
    default: null
  },
  pageId: {
    type: String,
    default: ''
  },
  formId: {
    type: String,
    default: ''
  },
  adId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['intake', 'qualified', 'not qualified', 'converted'],
    default: 'intake'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})


module.exports = mongoose.model('Lead', leadSchema)