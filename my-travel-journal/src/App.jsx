import React, { useEffect, useState } from 'react'
import JournalEntry from './components/JournalEntry.jsx'

const STORAGE_KEY = 'journalEntries'

export default function App() {
  const [entries, setEntries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  const [form, setForm] = useState({
    location: '',
    date: '',
    description: '',
    photo: ''
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  function addEntry(e) {
    e.preventDefault()
    if (!form.location || !form.date) return
    setEntries(prev => [...prev, { ...form, id: crypto.randomUUID() }])
    setForm({ location: '', date: '', description: '', photo: '' })
  }

  function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm(f => ({ ...f, photo: reader.result }))
    reader.readAsDataURL(file)
  }

  function removeEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="container">
      <header>
        <h1>Travel Journal</h1>
        <span className="tag">PWA</span>
      </header>

      <form onSubmit={addEntry} style={{display:'grid',gap:12,marginBottom:24}}>
        <div style={{display:'grid',gap:8,gridTemplateColumns:'1fr 180px',alignItems:'end'}}>
          <div style={{display:'grid',gap:8}}>
            <label>
              <div>Локація</div>
              <input required value={form.location} onChange={e=>setForm({...form, location:e.target.value})} placeholder="Kyiv, UA" />
            </label>
            <label>
              <div>Дата</div>
              <input required type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
            </label>
          </div>
          <label style={{display:'grid',gap:8}}>
            <div>Фото (необов'язково)</div>
            <input type="file" accept="image/*" onChange={onFile} />
          </label>
        </div>
        <label>
          <div>Опис</div>
          <textarea rows={3} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Короткий опис пригод" />
        </label>
        <div style={{display:'flex',gap:8}}>
          <button type="submit" style={{background:'#0078d4',color:'#fff',border:'0',padding:'10px 14px',borderRadius:8,cursor:'pointer'}}>Додати запис</button>
          <button type="button" onClick={()=>setEntries([])} style={{background:'#eee',border:'0',padding:'10px 14px',borderRadius:8,cursor:'pointer'}}>Очистити всі</button>
        </div>
      </form>

      <section style={{display:'grid',gap:12}}>
        {entries.length === 0 && <div style={{color:'#6b7280'}}>Поки що немає записів. Додайте перший!</div>}
        {entries.map(entry => (
          <JournalEntry key={entry.id} entry={entry} onDelete={()=>removeEntry(entry.id)} />
        ))}
      </section>

      <footer>
        Збереження в localStorage · Працює офлайн · Installable PWA
      </footer>

      <style>{`
        input, textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font: inherit; }
        input:focus, textarea:focus { outline: 2px solid #bfdbfe; border-color: #93c5fd; }
        label > div { font-size: .9rem; color: #374151; margin-bottom: 6px; }
        section article { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; }
      `}</style>
    </div>
  )
}
