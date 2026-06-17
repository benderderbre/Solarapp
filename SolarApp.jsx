import { useState, useEffect } from "react";

// ─── STORAGE ──────────────────────────────────────────────────────────────────
// Version bump forces a reset of old cached data
const STORAGE_KEY = "solarapp_v3";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── PLANT LIST ───────────────────────────────────────────────────────────────
const PLANT_NAMES = [
  "Burk","Buxheim","Dach Insys","Dachanlage Bogdahn","Egweil",
  "Ellingen I","Ellingen II","Ellingen III","Ellingen IV","Ergoldsbach",
  "Gardelegen","Großmehring","Hohenfels","Hohenfels II","Irlbach",
  "Jabel","Mainsondheim Komplett","Markt Bibart","Neuburg",
  "Offingen I","Offingen II","Offingen III","Offingen IV",
  "Perkam I","Perkam II","Rannungen I","Rannungen II","Roden",
  "Schierling I-1","Schierling II","Schierling III",
  "Unterspiesheim","Windischeschenbach","Zeitlarn","Zirndorf",
];

function pid(name) { return "p_" + name.toLowerCase().replace(/[^a-z0-9]/g,"_"); }
const EMPTY = () => ({ isolationErrors:[], defectiveDevices:[], powerBalanceOff:[], deviceType:"", otherNotes:"", commErrors:[] });

const INITIAL_DATA = {
  plants: PLANT_NAMES.map(n => ({ id: pid(n), name: n })),
  plantData: Object.fromEntries(PLANT_NAMES.map(n => {
    if (n === "Großmehring") return [pid(n), {
      isolationErrors: [],
      defectiveDevices: [
        {id:1,nr:"WR 10",serialNr:"",removed:false,reported:true},
        {id:2,nr:"WR 11",serialNr:"",removed:false,reported:true},
        {id:3,nr:"WR 12",serialNr:"",removed:false,reported:true},
        {id:4,nr:"WR 57",serialNr:"",removed:false,reported:true},
        {id:5,nr:"WR 60",serialNr:"",removed:false,reported:true},
        {id:6,nr:"WR 63",serialNr:"",removed:false,reported:true},
        {id:7,nr:"WR 113",serialNr:"",removed:false,reported:true},
        {id:8,nr:"WR 163",serialNr:"",removed:false,reported:true},
        {id:9,nr:"WR 164",serialNr:"",removed:false,reported:true},
        {id:10,nr:"WR 165",serialNr:"",removed:false,reported:true},
        {id:11,nr:"WR 202",serialNr:"",removed:false,reported:true},
        {id:12,nr:"WR 205",serialNr:"",removed:false,reported:true},
        {id:13,nr:"WR 208",serialNr:"",removed:false,reported:true},
        {id:14,nr:"WR 215",serialNr:"",removed:false,reported:true},
        {id:15,nr:"WR 218",serialNr:"",removed:false,reported:true},
        {id:16,nr:"WR 221",serialNr:"",removed:false,reported:true},
        {id:17,nr:"WR 226",serialNr:"",removed:false,reported:true},
        {id:18,nr:"WR 235",serialNr:"",removed:false,reported:true},
        {id:19,nr:"WR 236",serialNr:"",removed:false,reported:true},
        {id:20,nr:"WR 237",serialNr:"",removed:false,reported:true},
        {id:21,nr:"WR 239",serialNr:"",removed:false,reported:true},
        {id:22,nr:"WR 241",serialNr:"",removed:false,reported:true},
        {id:23,nr:"WR 245",serialNr:"",removed:false,reported:true},
      ],
      powerBalanceOff:[{id:1,nr:"WR (Power Balancer off)",note:"Klemmkasten braucht Tausch – Kasten vorhanden aber keine Klemmen. T-Stück defekt – evtl. abklären bei B Electric."}],
      deviceType:"Wechselrichter (WR)",
      otherNotes:"Klemmkasten braucht Tausch. Kasten vorhanden aber keine Klemmen. T-Stück defekt – evtl. abklären bei B Electric.",
      commErrors:[],
    }];
    return [pid(n), EMPTY()];
  })),
};

// ─── USERS ────────────────────────────────────────────────────────────────────
const USERS = [
  {username:"admin",    password:"admin123",  name:"Admin",    role:"admin"},
  {username:"marco",    password:"8501marco", name:"Marco",    role:"admin"},
  {username:"tom",      password:"8501tom",   name:"Tom",      role:"admin"},
  {username:"julian",   password:"8501julian",name:"Julian",   role:"admin"},
  {username:"johannes", password:"johan8501", name:"Johannes", role:"user"},
  {username:"henry",    password:"henry8501", name:"Henry",    role:"user"},
  {username:"jaworski", password:"rocki8501", name:"Jaworski", role:"user"},
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function totalFaults(pd) {
  return pd.isolationErrors.length + pd.defectiveDevices.length + pd.powerBalanceOff.length + pd.commErrors.length;
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:"#0b1120", surface:"#131f35", card:"#1a2a42", border:"#243654",
  accent:"#f59e0b", red:"#ef4444", redDim:"#450a0a",
  green:"#22c55e", greenDim:"#052e16", blueDim:"#1e3a5f",
  text:"#e2e8f0", muted:"#64748b",
};

const inp = {
  width:"100%", background:C.card, border:`1px solid ${C.border}`,
  borderRadius:8, padding:"10px 14px", color:C.text, fontSize:15,
  outline:"none", boxSizing:"border-box", marginBottom:16,
};
const btnP = {
  width:"100%", background:C.accent, color:"#000", border:"none",
  borderRadius:8, padding:"12px 0", fontWeight:700, fontSize:15, cursor:"pointer",
};
const btnD = {
  background:C.redDim, color:C.red, border:`1px solid ${C.red}`,
  borderRadius:8, padding:"7px 12px", cursor:"pointer", fontSize:13, fontWeight:600,
};
const btnG = {background:"transparent",color:C.muted,border:"none",cursor:"pointer",fontSize:14,padding:"6px 10px"};
const row = {background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10};
const tag = ok => ({fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:20,background:ok?C.greenDim:C.redDim,color:ok?C.green:C.red,border:`1px solid ${ok?C.green:C.red}`,cursor:"pointer"});
const badge = n => ({background:n>0?C.redDim:C.greenDim,color:n>0?C.red:C.green,borderRadius:20,padding:"3px 12px",fontSize:13,fontWeight:700,border:`1px solid ${n>0?C.red:C.green}`});

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]   = useState(null);
  const [db, setDb]       = useState(() => loadData() || INITIAL_DATA);
  const [view, setView]   = useState("home");
  const [plant, setPlant] = useState(null);
  const [section, setSec] = useState(null);

  useEffect(() => { saveData(db); }, [db]);

  const updPD = (plantId, fn) =>
    setDb(prev => ({...prev, plantData:{...prev.plantData,[plantId]:fn(prev.plantData[plantId])}}));

  if (!user) return <Login onLogin={setUser} />;

  const pd = plant ? (db.plantData[plant.id] || EMPTY()) : null;

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",color:C.text}}>
      <Header
        user={user} view={view} plant={plant} section={section}
        onBack={() => {
          if (view==="sub") { setView("detail"); setSec(null); }
          else if (view==="detail") { setView("home"); setPlant(null); }
        }}
        onLogout={() => { setUser(null); setView("home"); setPlant(null); setSec(null); }}
      />
      {view==="home" && (
        <Home db={db}
          onSelect={p => { setPlant(p); setView("detail"); }}
          onAdd={name => {
            const id = pid(name);
            setDb(prev => ({
              plants:[...prev.plants,{id,name}],
              plantData:{...prev.plantData,[id]:EMPTY()},
            }));
          }}
        />
      )}
      {view==="detail" && plant && (
        <Detail
          plant={plant} pd={pd}
          onRename={name => {
            setDb(prev => ({...prev, plants:prev.plants.map(p=>p.id===plant.id?{...p,name}:p)}));
            setPlant(prev => ({...prev,name}));
          }}
          onOpen={s => { setSec(s); setView("sub"); }}
          updPD={fn => updPD(plant.id, fn)}
        />
      )}
      {view==="sub" && plant && section && (
        <Sub section={section} pd={pd} updPD={fn => updPD(plant.id, fn)} />
      )}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [u,setU]       = useState("");
  const [p,setP]       = useState("");
  const [show,setShow] = useState(false);
  const [err,setErr]   = useState("");

  const go = () => {
    const found = USERS.find(x => x.username===u.trim() && x.password===p);
    if (found) onLogin(found); else setErr("Benutzername oder Passwort falsch.");
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${C.bg} 0%,#0d1f3c 100%)`}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"40px 36px",width:"100%",maxWidth:380,boxShadow:"0 24px 64px rgba(0,0,0,0.5)"}}>
        <div style={{fontSize:32,marginBottom:12}}>☀️</div>
        <div style={{fontSize:26,fontWeight:800,color:C.accent,marginBottom:4,letterSpacing:"-0.5px"}}>Solar Monitor</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:28}}>Anlagenverwaltung & Störungserfassung</div>

        <label style={{display:"block",fontSize:12,color:C.muted,marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Benutzername</label>
        <input style={inp} value={u} onChange={e=>setU(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="z.B. marco" />

        <label style={{display:"block",fontSize:12,color:C.muted,marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Passwort</label>
        <div style={{position:"relative",marginBottom:16}}>
          <input
            style={{...inp,marginBottom:0,paddingRight:44}}
            type={show?"text":"password"}
            value={p} onChange={e=>setP(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&go()}
            placeholder="••••••••"
          />
          <button
            onClick={()=>setShow(s=>!s)}
            style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.muted,padding:0,lineHeight:1}}
            title={show?"Passwort verbergen":"Passwort anzeigen"}
          >{show?"🙈":"👁️"}</button>
        </div>

        {err && <div style={{color:C.red,fontSize:13,marginBottom:12}}>{err}</div>}
        <button style={btnP} onClick={go}>Anmelden</button>
      </div>
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ user, view, plant, section, onBack, onLogout }) {
  const title = view==="home" ? "Alle Anlagen" : view==="detail" ? plant?.name : section?.label;
  return (
    <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {view!=="home" && <button style={btnG} onClick={onBack}>← Zurück</button>}
        {view==="home" && <span style={{fontSize:18}}>☀️</span>}
        <span style={{fontWeight:800,fontSize:17,color:C.accent,letterSpacing:"-0.3px"}}>{title}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:12,color:C.muted}}>{user.name}</span>
        <button style={btnG} onClick={onLogout} title="Abmelden">⎋</button>
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function Home({ db, onSelect, onAdd }) {
  const [name,setName] = useState("");
  const sorted = [...db.plants].sort((a,b)=>a.name.localeCompare(b.name,"de"));
  return (
    <div style={{padding:16}}>
      <div style={{fontSize:12,color:C.muted,marginBottom:12}}>{sorted.length} Anlagen</div>
      {sorted.map(p => {
        const pd = db.plantData[p.id] || EMPTY();
        const f  = totalFaults(pd);
        return (
          <div key={p.id}
            style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}
            onClick={()=>onSelect(p)}>
            <div>
              <div style={{fontWeight:700,fontSize:16}}>{p.name}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:3}}>
                Iso: {pd.isolationErrors.length} · Defekt: {pd.defectiveDevices.length} · PB: {pd.powerBalanceOff.length} · Komm: {pd.commErrors.length}
              </div>
            </div>
            <span style={badge(f)}>{f>0?`${f} Fehler`:"OK"}</span>
          </div>
        );
      })}
      <div style={{marginTop:20,borderTop:`1px solid ${C.border}`,paddingTop:16}}>
        <div style={{fontSize:12,color:C.muted,marginBottom:8,fontWeight:600}}>Neue Anlage</div>
        <div style={{display:"flex",gap:8}}>
          <input style={{...inp,marginBottom:0,flex:1}} value={name} onChange={e=>setName(e.target.value)} placeholder="Anlagenname" onKeyDown={e=>{if(e.key==="Enter"&&name.trim()){onAdd(name.trim());setName("");}}} />
          <button style={{...btnP,width:"auto",padding:"10px 18px"}} onClick={()=>{if(name.trim()){onAdd(name.trim());setName("");}}}>+</button>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL ───────────────────────────────────────────────────────────────────
function Detail({ plant, pd, onRename, onOpen, updPD }) {
  const [renaming,setRenaming] = useState(false);
  const [newName,setNewName]   = useState(plant.name);

  const sections = [
    {key:"isolationErrors",  label:"Isolationsfehler",      icon:"⚡", count:pd.isolationErrors.length},
    {key:"defectiveDevices", label:"Defekte Geräte",         icon:"🔧", count:pd.defectiveDevices.length},
    {key:"powerBalanceOff",  label:"Power Balance Off",      icon:"🔌", count:pd.powerBalanceOff.length},
    {key:"commErrors",       label:"Kommunikationsstörung",  icon:"📡", count:pd.commErrors.length},
    {key:"deviceType",       label:"Gerätetyp",              icon:"⚙️", count:null},
    {key:"otherNotes",       label:"Sonstige Notizen",       icon:"📝", count:null},
  ];

  return (
    <div style={{padding:16}}>
      {renaming ? (
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14}}>
          <input style={{...inp,marginBottom:0,flex:1}} value={newName} onChange={e=>setNewName(e.target.value)} />
          <button style={{...btnP,width:"auto",padding:"10px 16px"}} onClick={()=>{onRename(newName.trim());setRenaming(false);}}>✓</button>
          <button style={btnG} onClick={()=>setRenaming(false)}>✕</button>
        </div>
      ) : (
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <span style={{fontWeight:700,fontSize:15}}>{plant.name}</span>
          <button style={btnG} onClick={()=>setRenaming(true)}>✏️</button>
        </div>
      )}

      {sections.map(s => (
        <div key={s.key} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,marginBottom:10,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",cursor:"pointer"}} onClick={()=>onOpen(s)}>
            <span style={{fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>{s.icon}</span>{s.label}
            </span>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {s.count!==null && <span style={badge(s.count)}>{s.count}</span>}
              {s.key==="deviceType"  && <span style={{fontSize:12,color:C.muted}}>{pd.deviceType||"–"}</span>}
              {s.key==="otherNotes" && <span style={{fontSize:12,color:C.muted}}>{pd.otherNotes?"vorhanden":"–"}</span>}
              <span style={{color:C.muted}}>›</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SUB VIEW ROUTER ──────────────────────────────────────────────────────────
function Sub({ section, pd, updPD }) {
  const k = section.key;
  if (["isolationErrors","powerBalanceOff","commErrors"].includes(k))
    return <ListSec skey={k} pd={pd} updPD={updPD} />;
  if (k==="defectiveDevices")
    return <DefSec pd={pd} updPD={updPD} />;
  if (k==="deviceType")
    return <TxtSec label="Gerätetyp" value={pd.deviceType} onSave={v=>updPD(p=>({...p,deviceType:v}))} />;
  if (k==="otherNotes")
    return <TxtSec label="Sonstige Notizen" value={pd.otherNotes} onSave={v=>updPD(p=>({...p,otherNotes:v}))} multi />;
  return null;
}

// ─── LIST SECTION ─────────────────────────────────────────────────────────────
function ListSec({ skey, pd, updPD }) {
  const [nr,setNr]     = useState("");
  const [note,setNote] = useState("");
  const items  = pd[skey] || [];
  const sorted = [...items].sort((a,b)=>(parseInt(a.nr.replace(/\D/g,""))||0)-(parseInt(b.nr.replace(/\D/g,""))||0));

  const add = () => {
    if (!nr.trim()) return;
    updPD(p=>({...p,[skey]:[...p[skey],{id:Date.now(),nr:nr.trim(),note:note.trim()}]}));
    setNr(""); setNote("");
  };
  const del = id => updPD(p=>({...p,[skey]:p[skey].filter(x=>x.id!==id)}));

  return (
    <div style={{padding:16}}>
      <div style={{fontSize:12,color:C.muted,marginBottom:14}}>{items.length} Einträge – numerisch sortiert</div>
      {sorted.length===0 && <div style={{color:C.muted,fontSize:14,marginBottom:16}}>Keine Einträge</div>}
      {sorted.map(it => (
        <div key={it.id} style={row}>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,fontSize:15}}>{it.nr}</div>
            {it.note && <div style={{fontSize:12,color:C.muted,marginTop:2}}>{it.note}</div>}
          </div>
          <button style={btnD} onClick={()=>del(it.id)}>🗑</button>
        </div>
      ))}
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14,marginTop:6}}>
        <div style={{fontSize:12,color:C.muted,marginBottom:8,fontWeight:600}}>Eintrag hinzufügen</div>
        <input style={inp} value={nr} onChange={e=>setNr(e.target.value)} placeholder="Gerätenummer (z.B. WR 202)" />
        <input style={inp} value={note} onChange={e=>setNote(e.target.value)} placeholder="Notiz (optional)" onKeyDown={e=>e.key==="Enter"&&add()} />
        <button style={btnP} onClick={add}>Hinzufügen</button>
      </div>
    </div>
  );
}

// ─── DEFECTIVE DEVICES ────────────────────────────────────────────────────────
function DefSec({ pd, updPD }) {
  const [nr,setNr]         = useState("");
  const [serial,setSerial] = useState("");
  const devices = pd.defectiveDevices || [];
  const sorted  = [...devices].sort((a,b)=>(parseInt(a.nr.replace(/\D/g,""))||0)-(parseInt(b.nr.replace(/\D/g,""))||0));

  const tog = (id,f) => updPD(p=>({...p,defectiveDevices:p.defectiveDevices.map(d=>d.id===id?{...d,[f]:!d[f]}:d)}));
  const del = id     => updPD(p=>({...p,defectiveDevices:p.defectiveDevices.filter(d=>d.id!==id)}));
  const add = () => {
    if (!nr.trim()) return;
    updPD(p=>({...p,defectiveDevices:[...p.defectiveDevices,{id:Date.now(),nr:nr.trim(),serialNr:serial.trim(),removed:false,reported:false}]}));
    setNr(""); setSerial("");
  };

  return (
    <div style={{padding:16}}>
      <div style={{fontSize:12,color:C.muted,marginBottom:14}}>{devices.length} defekte Geräte</div>
      <div style={{display:"flex",gap:6,marginBottom:8,padding:"0 2px"}}>
        <div style={{flex:1,fontSize:11,color:C.muted,fontWeight:700}}>GERÄT</div>
        <div style={{fontSize:11,color:C.muted,fontWeight:700,width:82,textAlign:"center"}}>ABGEBAUT</div>
        <div style={{fontSize:11,color:C.muted,fontWeight:700,width:82,textAlign:"center"}}>GEMELDET</div>
        <div style={{width:36}}></div>
      </div>
      {sorted.map(d => (
        <div key={d.id} style={{...row,alignItems:"center",gap:6}}>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,fontSize:14}}>{d.nr}</div>
            {d.serialNr && <div style={{fontSize:11,color:C.muted}}>SN: {d.serialNr}</div>}
          </div>
          <button onClick={()=>tog(d.id,"removed")}  style={{...tag(d.removed), width:82,border:"none"}}>{d.removed?"Abgebaut":"Vor Ort"}</button>
          <button onClick={()=>tog(d.id,"reported")} style={{...tag(d.reported),width:82,border:"none"}}>{d.reported?"Gemeldet":"Offen"}</button>
          <button style={btnD} onClick={()=>del(d.id)}>🗑</button>
        </div>
      ))}
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14,marginTop:6}}>
        <div style={{fontSize:12,color:C.muted,marginBottom:8,fontWeight:600}}>Gerät hinzufügen</div>
        <input style={inp} value={nr}     onChange={e=>setNr(e.target.value)}     placeholder="Gerätenummer (z.B. WR 250)" />
        <input style={inp} value={serial} onChange={e=>setSerial(e.target.value)} placeholder="Seriennummer (optional)" onKeyDown={e=>e.key==="Enter"&&add()} />
        <button style={btnP} onClick={add}>Gerät hinzufügen</button>
      </div>
    </div>
  );
}

// ─── TEXT SECTION ─────────────────────────────────────────────────────────────
function TxtSec({ label, value, onSave, multi }) {
  const [val,setVal] = useState(value||"");
  return (
    <div style={{padding:16}}>
      <div style={{fontSize:13,color:C.muted,marginBottom:12}}>{label}</div>
      {multi
        ? <textarea style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:14,outline:"none",boxSizing:"border-box",resize:"vertical",minHeight:100}} value={val} onChange={e=>setVal(e.target.value)} placeholder={label+" eingeben..."} />
        : <input style={inp} value={val} onChange={e=>setVal(e.target.value)} placeholder={label+" eingeben..."} />
      }
      <button style={{...btnP,marginTop:8}} onClick={()=>onSave(val)}>Speichern</button>
    </div>
  );
}
