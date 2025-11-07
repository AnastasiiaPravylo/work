import React from 'react'

export default function JournalEntry({ entry, onDelete, onView, onEdit }) {
  return (
    <article>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:12,flexWrap:'wrap'}}>
        <h3 style={{margin:'4px 0'}}>{entry.location}</h3>
        <div className="meta">{new Date(entry.date).toLocaleDateString()}</div>
      </div>
      {Array.isArray(entry.photos) && entry.photos.length > 0 ? (
        <div style={{display:'grid',gap:8,margin:'8px 0'}}>
          {entry.photos.map((p, idx) => (
            <figure key={idx} style={{margin:0}}>
              <img src={p.src} alt={`Фото ${idx+1}`} style={{width:'100%',maxHeight:300,objectFit:'cover',borderRadius:8,border:'1px solid #e5e7eb'}} />
              {p.caption ? (
                <figcaption style={{fontSize:'.9rem',color:'#4b5563',marginTop:6}}>{p.caption}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : (
        entry.photo ? (
          <img src={entry.photo} alt="Фото подорожі" style={{width:'100%',maxHeight:300,objectFit:'cover',borderRadius:8,margin:'8px 0'}} />
        ) : null
      )}
      {entry.description && <p style={{margin:'8px 0 0'}}>{entry.description}</p>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginTop:12}}>
        <button onClick={onView} style={{background:'#f3f4f6',border:'0',height:36,borderRadius:8,cursor:'pointer'}}>Переглянути</button>
        <button onClick={onEdit} style={{background:'#e0f2fe',border:'0',height:36,borderRadius:8,cursor:'pointer',color:'#075985'}}>Редагувати</button>
        <button onClick={onDelete} style={{background:'#fee2e2',color:'#991b1b',border:'0',height:36,borderRadius:8,cursor:'pointer'}}>Видалити</button>
      </div>
    </article>
  )
}
