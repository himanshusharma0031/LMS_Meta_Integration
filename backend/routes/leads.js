const express = require('express')
const router = express.Router()
const Lead = require('../models/Lead')


const normalizeStatus = (value) => {
  const normalized = String(value || '').trim().toLowerCase()

  if (!normalized) return 'intake'
  if (normalized === 'new') return 'intake'
  if (normalized === 'contacted') return 'qualified'
  if (normalized === 'not-qualified' || normalized === 'not_qualified') return 'not qualified'

  return normalized
}


router.get('/', async (req, res) => {
  try {
    const { source, status } = req.query
    let filter = {}

    if (source) filter.source = source
    if (status) filter.status = normalizeStatus(status)

    const leads = await Lead.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, leads })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})


router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.json({ success: true, lead })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})


router.patch('/:id/status', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status: normalizeStatus(req.body.status) },
      { returnDocument: 'after' }
    )
    res.json({ success: true, lead })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})


router.delete('/:id', async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Lead deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router