import './StatCards.css'

function StatCards({ leads }) {

  const total = leads.length
  const intake = leads.filter(l => l.status === 'intake').length
  const qualified = leads.filter(l => l.status === 'qualified').length
  const converted = leads.filter(l => l.status === 'converted').length
  const pct = (n) => total ? Math.round((n / total) * 100) : 0

  const cards = [
    { label: 'Total Leads', num: total, color: '#1e293b', sub: 'all records' },
    { label: 'Intake', num: intake, color: '#f59e0b', sub: `${pct(intake)}%` },
    { label: 'Qualified', num: qualified, color: '#1d4ed8', sub: `${pct(qualified)}%` },
    { label: 'Converted', num: converted, color: '#15803d', sub: `${pct(converted)}%` },
  ]

  return (
    <div className="stat-grid">
      {cards.map(c => (
        <div key={c.label} className="stat-card">
          <div className="stat-label">{c.label}</div>
          <div className="stat-num" style={{ color: c.color }}>{c.num}</div>
          <div className="stat-sub" style={{ color: c.color }}>{c.sub}</div>
        </div>
      ))}
    </div>
  )
}

export default StatCards