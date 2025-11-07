import React, { useEffect, useRef, useState } from 'react'
import JournalEntry from './components/JournalEntry.jsx'

const STORAGE_KEY = 'journalEntries'

export default function App() {
  const [entries, setEntries] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      // migrate: ensure type
      return Array.isArray(raw) ? raw.map(it => ({
        type: 'type' in it ? it.type : 'memory',
        ...it
      })) : []
    } catch {
      return []
    }
  })

  const [form, setForm] = useState({
    location: '',
    date: '',
    description: '',
    photo: '',
    photos: [],
    type: 'memory'
  })

  const fileInputRef = useRef(null)
  const modalFileInputRef = useRef(null)

  const [openId, setOpenId] = useState(null)
  const [edit, setEdit] = useState(null)
  const [routeId, setRouteId] = useState(null)
  const [viewIndex, setViewIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('memory') // 'planned' | 'memory'
  const [formError, setFormError] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    function syncRoute() {
      const m = window.location.hash.match(/^#\/entry\/(.+)$/)
      setRouteId(m ? m[1] : null)
    }
    syncRoute()
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  useEffect(() => {
    // reset slider index on route change
    setViewIndex(0)
  }, [routeId])

  function addEntry(e) {
    e.preventDefault()
    setFormError('')
    if (!form.location) {
      setFormError('Вкажіть локацію')
      return
    }
    // validation by type
    const today = new Date()
    today.setHours(0,0,0,0)
    const hasDate = !!form.date
    const d = hasDate ? new Date(form.date) : null
    if (form.type === 'memory') {
      if (!hasDate) { setFormError('Для спогаду потрібна дата'); return }
      if (d > today) { setFormError('Дата спогаду не може бути в майбутньому'); return }
    }
    const normalized = {
      ...form,
      id: crypto.randomUUID(),
      photos: (form.photos && form.photos.length > 0)
        ? form.photos
        : (form.photo ? [{ src: form.photo, caption: '' }] : [])
    }
    setEntries(prev => [...prev, normalized])
    setForm({ location: '', date: '', description: '', photo: '', photos: [], type: activeTab })
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

  function openDetails(entry) {
    setOpenId(entry.id)
    // create deep-ish copy for editing
    setEdit({
      id: entry.id,
      location: entry.location || '',
      date: entry.date || '',
      description: entry.description || '',
      photos: Array.isArray(entry.photos) ? entry.photos.map(p=>({ ...p })) : (entry.photo ? [{ src: entry.photo, caption: '' }] : [])
    })
  }

  function modalAddFiles(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => setEdit(ed => ({ ...ed, photos: [...(ed?.photos||[]), { src: reader.result, caption: '' }] }))
      reader.readAsDataURL(file)
    })
  }

  function modalUpdateCaption(i, v) {
    setEdit(ed => {
      const next = [...(ed?.photos||[])]
      if (next[i]) next[i] = { ...next[i], caption: v }
      return { ...ed, photos: next }
    })
  }

  function modalRemovePhoto(i) {
    setEdit(ed => {
      const next = [...(ed?.photos||[])]
      next.splice(i,1)
      return { ...ed, photos: next }
    })
  }

  function saveEdit() {
    if (!edit) return
    setEntries(prev => prev.map(it => it.id === edit.id ? { ...it, ...edit } : it))
    setOpenId(null)
    setEdit(null)
  }

  function closeModal() {
    setOpenId(null)
    setEdit(null)
  }

  function goToView(id) {
    window.location.hash = `#/entry/${id}`
  }

  function goHome() {
    window.location.hash = '#/'
  }

  // helper: convert planned -> memory
  function convertToMemory(entryId) {
    setEntries(prev => prev.map(it => {
      if (it.id !== entryId) return it
      const today = new Date()
      const ymd = new Date(today.getTime()); ymd.setHours(0,0,0,0)
      const dateStr = it.date ? it.date : new Date().toISOString().slice(0,10)
      return { ...it, type: 'memory', date: dateStr }
    }))
  }

  return (
    <div className="container">
      <header>
        <h1>Travel Journal</h1>
        <span className="tag">PWA</span>
      </header>

      {/* Tabs */}
      <div style={{display:'flex',gap:16,marginTop:12,marginBottom:16}}>
        <button onClick={()=>{setActiveTab('memory'); setForm(f=>({...f, type:'memory'}))}} style={{background: activeTab==='memory'?'#e0e7ff':'#f3f4f6',border:'0',padding:'8px 12px',borderRadius:999,cursor:'pointer'}}>Спогади</button>
        <button onClick={()=>{setActiveTab('planned'); setForm(f=>({...f, type:'planned'}))}} style={{background: activeTab==='planned'?'#d1fae5':'#f3f4f6',border:'0',padding:'8px 12px',borderRadius:999,cursor:'pointer'}}>Заплановані</button>
      </div>

      <form onSubmit={addEntry} style={{display:'grid',gap:12,marginBottom:24}}>
        <div style={{display:'grid',gap:8,gridTemplateColumns:'1fr 220px',alignItems:'end'}}>
          <div style={{display:'grid',gap:8}}>
            <label>
              <div>Локація</div>
              <input required value={form.location} onChange={e=>setForm({...form, location:e.target.value})} placeholder="Kyiv, UA" />
            </label>
            <label>
              <div>Дата {form.type==='memory' ? '(обовʼязково, не в майбутньому)' : '(необовʼязково)'}</div>
              <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
              {formError && <div style={{color:'#b91c1c',fontSize:12,marginTop:4}}>{formError}</div>}
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

      {!routeId && (
        <section style={{display:'grid',gap:12}}>
          {entries.length === 0 && <div style={{color:'#6b7280'}}>Поки що немає записів. Додайте перший!</div>}
          {entries.filter(e=> e.type === activeTab).map(entry => (
            <JournalEntry
              key={entry.id}
              entry={entry}
              onDelete={()=>removeEntry(entry.id)}
              onView={()=>goToView(entry.id)}
              onEdit={()=>openDetails(entry)}
            />
          ))}
        </section>
      )}
      {routeId && (() => {
        const entry = entries.find(e => e.id === routeId)
        if (!entry) return (
          <section style={{display:'grid',gap:12}}>
            <div style={{color:'#6b7280'}}>Запис не знайдено.</div>
            <div><button onClick={goHome} style={{background:'#f3f4f6',border:'0',padding:'10px 14px',borderRadius:8,cursor:'pointer'}}>Назад</button></div>
          </section>
        )
        return (
          <section style={{display:'grid',gap:20, maxWidth:1680, margin:'0 auto', gridTemplateAreas:`
            'left right'
            'actions actions'
          `, gridTemplateColumns:'220px 1fr'}}>
            <aside style={{gridArea:'left',display:'grid',gap:10}}>
              <h2 style={{margin:0,fontWeight:700,fontSize:'1.4rem'}}>{entry.location}</h2>
              <div style={{color:'#6b7280'}}>{new Date(entry.date).toLocaleDateString()}</div>
              {entry.description && <p style={{margin:0}}>{entry.description}</p>}
            </aside>
            <div style={{gridArea:'right',display:'grid',gap:16,justifyItems:'stretch'}}>
              {Array.isArray(entry.photos) && entry.photos.length > 0 ? (
                <>
                  <div style={{position:'relative', width:'100%'}}>
                    <button onClick={()=>setViewIndex(i=> (i-1+entry.photos.length)%entry.photos.length)} aria-label="Попереднє фото" style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',background:'#ffffffcc',border:'1px solid #e5e7eb',borderRadius:999,padding:'8px 12px',cursor:'pointer'}}>‹</button>
                    <img src={entry.photos[viewIndex]?.src} alt={`Фото ${viewIndex+1}`} style={{display:'block',width:'100%',height:'auto',maxHeight:'80vh',objectFit:'contain',background:'rgba(255,255,255,.03)',borderRadius:12,border:'1px solid #e5e7eb'}} />
                    <button onClick={()=>setViewIndex(i=> (i+1)%entry.photos.length)} aria-label="Наступне фото" style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'#ffffffcc',border:'1px solid #e5e7eb',borderRadius:999,padding:'8px 12px',cursor:'pointer'}}>›</button>
                  </div>
                  <div style={{textAlign:'center',color:'#6b7280'}}>Фото {viewIndex+1} з {entry.photos.length}</div>
                  <div>
                    <div style={{fontWeight:600, marginBottom:6}}>Підписи</div>
                    <ul style={{listStyle:'decimal', paddingLeft:18, margin:0, display:'grid', gap:6}}>
                      {entry.photos.map((p,i)=> (
                        <li key={i} style={{color: i===viewIndex ? '#111827' : '#4b5563'}}>{p.caption || 'Без підпису'}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (entry.photo ? (
                <img src={entry.photo} alt="Фото" style={{width:'100%',height:'auto',maxHeight:'80vh',objectFit:'contain',background:'rgba(255,255,255,.03)',borderRadius:12,border:'1px solid #e5e7eb'}} />
              ) : null)}
            </div>
            <div style={{gridArea:'actions',display:'flex',gap:12,justifyContent:'flex-start',marginTop:4}}>
              <button onClick={goHome} style={{background:'#f3f4f6',border:'0',padding:'10px 16px',borderRadius:8,cursor:'pointer',height:40}}>Назад</button>
              <button onClick={()=>openDetails(entry)} style={{background:'#e0f2fe',border:'0',padding:'10px 16px',borderRadius:8,cursor:'pointer',color:'#075985',height:40}}>Редагувати</button>
              {entry.type === 'planned' && (
                <button onClick={()=>convertToMemory(entry.id)} style={{background:'#ede9fe',border:'0',padding:'10px 16px',borderRadius:8,cursor:'pointer',color:'#5b21b6',height:40}}>Позначити як спогад</button>
              )}
            </div>
          </section>
        )
      })()}
      {openId && edit && (
        <div role="dialog" aria-modal="true" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'grid',placeItems:'center',padding:16,zIndex:50}} onClick={closeModal}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:12, maxWidth:800, width:'100%', boxShadow:'0 10px 30px rgba(0,0,0,0.2)', display:'grid', gridTemplateRows:'auto 1fr auto', maxHeight:'90vh'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:16,borderBottom:'1px solid #e5e7eb'}}>
              <h2 style={{margin:0,color:'#111827',fontWeight:700,fontSize:'1.25rem'}}>Деталі подорожі</h2>
              <button onClick={closeModal} style={{background:'transparent',border:'0',fontSize:22,cursor:'pointer'}}>&times;</button>
            </div>
            <div style={{display:'grid',gap:12, padding:16, overflowY:'auto'}}>
              <label>
                <div>Локація</div>
                <input value={edit.location} onChange={e=>setEdit({...edit, location:e.target.value})} style={{color:'#111827'}} />
              </label>
              <label>
                <div>Дата</div>
                <input type="date" value={edit.date} onChange={e=>setEdit({...edit, date:e.target.value})} style={{color:'#111827'}} />
              </label>
              <label>
                <div>Опис</div>
                <textarea rows={3} value={edit.description} onChange={e=>setEdit({...edit, description:e.target.value})} style={{color:'#111827'}} />
              </label>
              <div style={{display:'grid',gap:8}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <strong>Фото</strong>
                  <div>
                    <input ref={modalFileInputRef} style={{display:'none'}} type="file" accept="image/*" multiple onChange={modalAddFiles} />
                    <button type="button" onClick={()=>modalFileInputRef.current?.click()} style={{background:'#f3f4f6',border:'1px solid #e5e7eb',padding:'8px 12px',borderRadius:8,cursor:'pointer'}}>Додати фото</button>
                  </div>
                </div>
                {edit.photos?.length > 0 && edit.photos.map((p, idx) => (
                  <div key={idx} style={{display:'grid',gap:6,gridTemplateColumns:'140px 1fr auto',alignItems:'center'}}>
                    <img src={p.src} alt={`фото ${idx+1}`} style={{width:140,height:90,objectFit:'cover',borderRadius:6,border:'1px solid #e5e7eb'}} />
                    <input placeholder="Підпис" value={p.caption||''} onChange={e=>modalUpdateCaption(idx, e.target.value)} style={{color:'#111827'}} />
                    <button type="button" onClick={()=>modalRemovePhoto(idx)} style={{background:'#eee',border:'0',padding:'8px 10px',borderRadius:8,cursor:'pointer'}}>×</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8, padding:16, borderTop:'1px solid #e5e7eb'}}>
              <button type="button" onClick={closeModal} style={{background:'#eee',border:'0',padding:'10px 14px',borderRadius:8,cursor:'pointer'}}>Скасувати</button>
              <button type="button" onClick={saveEdit} style={{background:'#0078d4',color:'#fff',border:'0',padding:'10px 14px',borderRadius:8,cursor:'pointer'}}>Зберегти</button>
            </div>
          </div>
        </div>
      )}

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
