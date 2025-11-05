import React from 'react'

export default function JournalEntry({ entry, onDelete }) {
  return (
    <article>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:12,flexWrap:'wrap'}}>
        <h3 style={{margin:'4px 0'}}>{entry.location}</h3>
        <div className="meta">{new Date(entry.date).toLocaleDateString()}</div>
      </div>
      {entry.photo && (
        <img src={entry.photo} alt="Фото подорожі" style={{width:'100%',maxHeight:300,objectFit:'cover',borderRadius:8,margin:'8px 0'}} />
      )}
      {entry.description && <p style={{margin:'8px 0 0'}}>{entry.description}</p>}
      <div style={{display:'flex',justifyContent:'flex-end'}}>
        <button onClick={onDelete} style={{background:'#fee2e2',color:'#991b1b',border:'0',padding:'8px 12px',borderRadius:8,cursor:'pointer'}}>Видалити</button>
      </div>
    </article>
  )
}
