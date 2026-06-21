import './Charts.css'

function Charts({ leads }) {

  const count = (key, val) => leads.filter(l => l[key] === val).length

  const sources = [
    { label: 'Website', val: count('source','website'), color: '#1d4ed8', max: leads.length },
    { label: 'Meta',    val: count('source','meta'),    color: '#6d28d9', max: leads.length },
    { label: 'Google',  val: count('source','google'),  color: '#15803d', max: leads.length },
  ]

  const statuses = [
    { label: 'Intake',        val: count('status','intake'),        color: '#f59e0b', max: leads.length },
    { label: 'Qualified',     val: count('status','qualified'),     color: '#1d4ed8', max: leads.length },
    { label: 'Not Qualified', val: count('status','not qualified'), color: '#ef4444', max: leads.length },
    { label: 'Converted',     val: count('status','converted'),     color: '#15803d', max: leads.length },
  ]

  const pct = (val, max) => max ? Math.round((val / max) * 100) : 0

  return (
    <div className="charts-grid">

      {/* Source chart */}
      <div className="chart-box">
        <div className="chart-title">Leads according to source</div>
        {sources.map(s => (
          <div key={s.label} className="bar-row">
            <div className="bar-label">{s.label}</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: pct(s.val, s.max)+'%', background: s.color }} />
            </div>
            <div className="bar-val">{s.val}</div>
          </div>
        ))}
      </div>

      {/* Status chart */}
      <div className="chart-box">
        <div className="chart-title">Leads according to status</div>
        {statuses.map(s => (
          <div key={s.label} className="bar-row">
            <div className="bar-label">{s.label}</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: pct(s.val, s.max)+'%', background: s.color }} />
            </div>
            <div className="bar-val">{s.val}</div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Charts