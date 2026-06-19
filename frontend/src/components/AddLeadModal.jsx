import { useState } from 'react'
import axios from 'axios'
import './AddLeadModal.css'
import BASE_URL from '../api'

const blank = { name:'', phone:'', email:'', service:'', source:'website', campaign:'' }

function AddLeadModal({ onClose, onRefresh }) {

  const [form, setForm]   = useState(blank)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const save = async () => {
    if (!form.name || !form.phone || !form.email) {
      setError('all fields required!')
      return
    }


if (!/^[0-9]{10}$/.test(form.phone)) {
    setError('Please enter valid no.!')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

if (!emailRegex.test(form.email)) {
  setError(" enter Valid email")
  return
}

    setSaving(true)
    try {
      await axios.post(`${BASE_URL}/webhook/${form.source}`, form)
      onRefresh()
      onClose()
    } catch {
      setError('Please enter valid fields')
    }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        <div className="modal-title">Add new Lead</div>
        <div className="modal-sub">All * fields are required</div>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-row2">
          <div className="form-group">
            <label>Name *</label>
            <input name="name" placeholder="Full name" onChange={handle} />
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input name="phone" placeholder="Phone no." onChange={handle} />
          </div>
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input name="email" placeholder="name@gmail.com"  type='email' onChange={handle} />
        </div>

        <div className="form-row2">
          <div className="form-group">
            <label>Service</label>
            <input name="service" placeholder="Web Dev" onChange={handle} />
          </div>
          <div className="form-group">
            <label>Source *</label>
            <select name="source" onChange={handle}>
              <option value="website">Website</option>
              <option value="meta">Meta</option>
              <option value="google">Google</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Campaign</label>
          <input name="campaign" placeholder="Summer Sale" onChange={handle} />
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save"   onClick={save}>
            {saving ? 'Saving...' : 'Save Lead'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default AddLeadModal