import React, { useEffect, useRef, useState } from 'react'
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
    photo: '',
    photos: []
  })

  const fileInputRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  function addEntry(e) {
    e.preventDefault()
    if (!form.location || !form.date) return
    const normalized = {
      ...form,
      id: crypto.randomUUID(),
      photos: (form.photos && form.photos.length > 0)
        ? form.photos
        : (form.photo ? [{ src: form.photo, caption: '' }] : [])
    }
    setEntries(prev => [...prev, normalized])
    setForm({ location: '', date: '', description: '', photo: '', photos: [] })
  }

  function onFile(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        setForm(f => ({
          ...f,
          photos: [...(f.photos || []), { src: reader.result, caption: '' }]
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  function updateCaption(index, value) {
    setForm(f => {
      const next = [...(f.photos || [])]
      if (next[index]) next[index] = { ...next[index], caption: value }
      return { ...f, photos: next }
    })
  }

  function removeSelectedPhoto(index) {
    setForm(f => {
      const next = [...(f.photos || [])]
      next.splice(index, 1)
      return { ...f, photos: next }
    })
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
        <div style={{display:'grid',gap:8,gridTemplateColumns:'1fr 220px',alignItems:'end'}}>
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
          <label style={{display:'grid',gap:6,alignItems:'center',justifyItems:'center'}}>
            <div style={{fontSize:'.9rem',color:'#374151',textAlign:'center'}}>Фото (декілька, необов'язково)</div>
            <input ref={fileInputRef} style={{display:'none'}} type="file" accept="image/*" multiple onChange={onFile} />
            <div style={{display:'flex',gap:8,alignItems:'center',justifyContent:'center',width:'100%'}}>
              <button
                type="button"
                onClick={()=>fileInputRef.current?.click()}
                style={{
                  background:'#ffffff',
                  border:'1px solid #e5e7eb',
                  padding:'10px 14px',
                  borderRadius:8,
                  cursor:'pointer',
                  color:'#111827',
                  boxShadow:'0 1px 2px rgba(0,0,0,0.04)',
                  height:'40px',
                  display:'inline-flex',
                  alignItems:'center',
                  gap:6,
                  font:'inherit'
                }}
              >Підвантажити ще фото</button>
              {form.photos?.length > 0 && (
                <span style={{
                  fontSize:'.8rem',
                  color:'#3730a3',
                  background:'#eef2ff',
                  padding:'3px 8px',
                  borderRadius:999
                }}>Додано: {form.photos.length}</span>
              )}
            </div>
          </label>
        </div>
        {form.photos?.length > 0 && (
          <div style={{display:'grid',gap:8}}>
            {form.photos.map((p, idx) => (
              <div key={idx} style={{display:'grid',gap:6,gridTemplateColumns:'120px 1fr auto',alignItems:'center'}}>
                <img src={p.src} alt="прев'ю" style={{width:120,height:80,objectFit:'cover',borderRadius:6,border:'1px solid #e5e7eb'}} />
                <input
                  placeholder="Підпис до фото"
                  value={p.caption || ''}
                  onChange={e=>updateCaption(idx,e.target.value)}
                />
                <button type="button" onClick={()=>removeSelectedPhoto(idx)} style={{background:'#eee',border:'0',padding:'8px 10px',borderRadius:8,cursor:'pointer'}}>×</button>
              </div>
            ))}
          </div>
        )}
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
