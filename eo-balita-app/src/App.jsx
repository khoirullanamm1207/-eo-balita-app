import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── Palette ClaudeHR ────────────────────────────────────────────────────────
const C = {
  navy:"#1A3C5E", emerald:"#2E9E6B", amber:"#F4A623", neutral:"#F7F9FC",
  charcoal:"#2D3748", bg:"#0F2235", bgCard:"#152F4A", bgCard2:"#1C3D5E",
  text:"#E8F0F7", muted:"#8AAFC8", green:"#6EE7A8", red:"#FF7070",
};

// ─── Storage helpers (localStorage) ─────────────────────────────────────────
const KEYS = { events:"eo_events", checklist:"eo_checklist", barang:"eo_barang", rundown:"eo_rundown", rab:"eo_rab", absensi:"eo_absensi" };

const load  = (key, def) => { try { const v=localStorage.getItem(key); return v?JSON.parse(v):def; } catch{ return def; } };
const save  = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch{} };

// ─── Default data ─────────────────────────────────────────────────────────────
const DEF_EVENTS = [
  {id:"EV-001",nama:"Sensory Play Morning",tipe:"Sensory Class",tanggal:"2026-06-07",lokasi:"Gedung Graha Bunda",kapasitas:20,pic:"Anam",status:"Confirmed",catatan:"Tema: air & pasir"},
  {id:"EV-002",nama:"Lomba Mewarnai",tipe:"Lomba",tanggal:"2026-06-14",lokasi:"Taman Kota",kapasitas:30,pic:"Dina",status:"Planning",catatan:"Usia 2-4 tahun"},
];
const DEF_CK = [
  {id:1,fase:"📋 H-14",task:"Konfirmasi tanggal & venue",pic:"PIC Venue",status:"Belum",prioritas:"Tinggi"},
  {id:2,fase:"📋 H-14",task:"Buat & sebar flyer promosi",pic:"PIC Desain",status:"Belum",prioritas:"Tinggi"},
  {id:3,fase:"📋 H-14",task:"Buka pendaftaran peserta",pic:"Admin",status:"Belum",prioritas:"Tinggi"},
  {id:4,fase:"📋 H-7",task:"Konfirmasi jumlah peserta",pic:"Admin",status:"Belum",prioritas:"Tinggi"},
  {id:5,fase:"📋 H-7",task:"Pesan bahan/material aktivitas",pic:"PIC Logistik",status:"Belum",prioritas:"Tinggi"},
  {id:6,fase:"📋 H-3",task:"Kirim reminder ke peserta",pic:"Admin",status:"Belum",prioritas:"Tinggi"},
  {id:7,fase:"📋 H-3",task:"Cek & kemas perlengkapan",pic:"PIC Logistik",status:"Belum",prioritas:"Tinggi"},
  {id:8,fase:"📋 H-1",task:"Survei & set-up venue",pic:"Tim Dekorasi",status:"Belum",prioritas:"Tinggi"},
  {id:9,fase:"🎉 Hari-H",task:"Registrasi & sambut peserta",pic:"Admin",status:"Belum",prioritas:"Tinggi"},
  {id:10,fase:"🎉 Hari-H",task:"Dokumentasi foto & video",pic:"PIC Dok",status:"Belum",prioritas:"Sedang"},
  {id:11,fase:"📊 H+1",task:"Rekap absensi peserta",pic:"Admin",status:"Belum",prioritas:"Sedang"},
  {id:12,fase:"📊 H+1",task:"Upload dokumentasi ke Drive",pic:"PIC Dok",status:"Belum",prioritas:"Rendah"},
];
const DEF_BARANG = [
  {id:1,kategori:"📄 Administrasi",nama:"Form Absensi",satuan:"lembar",jmlBawa:2,statusPack:"Belum Pack",kondisi:"Baik"},
  {id:2,kategori:"📄 Administrasi",nama:"Name Tag Peserta",satuan:"set",jmlBawa:1,statusPack:"Belum Pack",kondisi:"Baik"},
  {id:3,kategori:"🎨 Aktivitas",nama:"Matras/Play Mat",satuan:"buah",jmlBawa:5,statusPack:"Belum Pack",kondisi:"Baik"},
  {id:4,kategori:"🎨 Aktivitas",nama:"Bak Sensory",satuan:"buah",jmlBawa:4,statusPack:"Belum Pack",kondisi:"Baik"},
  {id:5,kategori:"🍳 Cooking Date",nama:"Celemek Anak",satuan:"buah",jmlBawa:20,statusPack:"Belum Pack",kondisi:"Baik"},
  {id:6,kategori:"📸 Dokumentasi",nama:"Kamera / HP utama",satuan:"unit",jmlBawa:1,statusPack:"Belum Pack",kondisi:"Baik"},
  {id:7,kategori:"🎁 Goodie Bag",nama:"Goodie Bag peserta",satuan:"buah",jmlBawa:30,statusPack:"Belum Pack",kondisi:"Baik"},
  {id:8,kategori:"🏥 P3K",nama:"Kotak P3K lengkap",satuan:"set",jmlBawa:1,statusPack:"Belum Pack",kondisi:"Baik"},
];
const DEF_RUNDOWN = [
  {id:1,waktuMulai:"08:00",waktuSelesai:"08:30",durasi:30,sesi:"Registrasi & Welcome",pic:"Admin",status:"Belum"},
  {id:2,waktuMulai:"08:30",waktuSelesai:"08:45",durasi:15,sesi:"Opening & Sambutan",pic:"MC",status:"Belum"},
  {id:3,waktuMulai:"08:45",waktuSelesai:"09:30",durasi:45,sesi:"Sesi Aktivitas Utama 1",pic:"Fasilitator",status:"Belum"},
  {id:4,waktuMulai:"09:30",waktuSelesai:"09:45",durasi:15,sesi:"Snack Time",pic:"PIC F&B",status:"Belum"},
  {id:5,waktuMulai:"09:45",waktuSelesai:"10:30",durasi:45,sesi:"Sesi Aktivitas Utama 2",pic:"Fasilitator",status:"Belum"},
  {id:6,waktuMulai:"10:30",waktuSelesai:"11:00",durasi:30,sesi:"Pembagian Hadiah",pic:"PIC Hadiah",status:"Belum"},
  {id:7,waktuMulai:"11:00",waktuSelesai:"11:30",durasi:30,sesi:"Dokumentasi & Penutup",pic:"MC",status:"Belum"},
];
const DEF_RAB = [
  {id:1,kategori:"🏢 Venue",deskripsi:"Sewa ruangan",satuan:"sesi",qty:1,estimasi:500000,realisasi:0},
  {id:2,kategori:"🎨 Bahan",deskripsi:"Material sensory play",satuan:"paket",qty:1,estimasi:200000,realisasi:0},
  {id:3,kategori:"🍱 F&B",deskripsi:"Snack box anak",satuan:"kotak",qty:25,estimasi:20000,realisasi:0},
  {id:4,kategori:"🎁 Goodie Bag",deskripsi:"Goodie bag peserta",satuan:"buah",qty:20,estimasi:30000,realisasi:0},
  {id:5,kategori:"👥 Tim",deskripsi:"Honor fasilitator",satuan:"orang",qty:2,estimasi:250000,realisasi:0},
  {id:6,kategori:"📣 Promosi",deskripsi:"Desain flyer",satuan:"paket",qty:1,estimasi:100000,realisasi:0},
];
const DEF_ABSENSI = Array.from({length:10},(_,i)=>({id:i+1,namaAnak:"",usia:"",namaOrtu:"",noHp:"",statusBayar:"Belum Bayar",hadir:"Belum",catatan:""}));

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = n => n>=1000000?`Rp ${(n/1000000).toFixed(1)}jt`:`Rp ${Number(n).toLocaleString("id-ID")}`;
const pct = (a,b) => b===0?0:Math.round(a/b*100);

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputStyle = {
  background:"#0F2235", border:`1px solid ${C.muted}44`, borderRadius:8,
  color:C.text, padding:"7px 10px", fontSize:12, fontFamily:"'DM Sans',sans-serif",
  width:"100%", outline:"none",
};
const selStyle = {...inputStyle, cursor:"pointer"};
const btnStyle = (color=C.emerald) => ({
  background:color, border:"none", borderRadius:8, color:"#fff",
  padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer",
  fontFamily:"'DM Sans',sans-serif", transition:"opacity .15s",
});
const thStyle = {
  background:C.navy, color:C.text, fontSize:10, fontWeight:700,
  padding:"8px 10px", textAlign:"center", fontFamily:"'DM Sans',sans-serif",
  letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap",
};
const tdStyle = (bg="#0F2235") => ({
  background:bg, color:C.text, fontSize:11, padding:"7px 8px",
  fontFamily:"'DM Sans',sans-serif", borderBottom:`1px solid ${C.muted}22`,
  verticalAlign:"middle",
});

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionTitle({icon, children, accent=C.emerald}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
      <div style={{width:3,height:18,background:accent,borderRadius:2}}/>
      <span style={{color:C.text,fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:13}}>{icon} {children}</span>
    </div>
  );
}
function Card({children, style={}}) {
  return <div style={{background:C.bgCard,border:`1px solid ${C.muted}22`,borderRadius:14,padding:18,...style}}>{children}</div>;
}
function KPICard({label, value, sub, accent=C.emerald, icon}) {
  return (
    <div style={{background:`linear-gradient(135deg,${C.bgCard},${C.bgCard2})`,border:`1px solid ${accent}44`,borderRadius:14,padding:"16px 18px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-15,right:-15,width:60,height:60,background:`radial-gradient(circle,${accent}33,transparent)`,borderRadius:"50%"}}/>
      <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
      <div style={{color:C.muted,fontSize:10,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>{label}</div>
      <div style={{color:C.text,fontSize:26,fontWeight:800,fontFamily:"'Sora',sans-serif",margin:"4px 0 2px"}}>{value}</div>
      {sub&&<div style={{color:accent,fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>{sub}</div>}
    </div>
  );
}
const STATUS_COLORS = {
  "Done":"#1B4D2E","On Progress":"#4D3A00","Confirmed":"#1A2E4A",
  "Planning":"#2D2D3D","Cancelled":"#4D1A1A",
  "Selesai":"#1B4D2E","Belum":"#2D2D3D","Skip":"#333",
  "Sudah Pack":"#1B4D2E","Belum Pack":"#2D2D3D","Rusak":"#4D1A1A",
  "Hadir":"#1B4D2E","Tidak Hadir":"#4D1A1A","Izin":"#4D3A00",
  "Lunas":"#1B4D2E","DP":"#4D3A00","Belum Bayar":"#4D1A1A",
  "Tinggi":"#4D1A1A","Sedang":"#4D3A00","Rendah":"#1B4D2E",
};
const STATUS_TEXT = {
  "Done":C.green,"On Progress":C.amber,"Confirmed":"#60A5FA","Planning":C.muted,"Cancelled":"#FF7070",
  "Selesai":C.green,"Belum":C.muted,"Skip":"#888",
  "Sudah Pack":C.green,"Belum Pack":C.muted,"Rusak":"#FF7070",
  "Hadir":C.green,"Tidak Hadir":"#FF7070","Izin":C.amber,
  "Lunas":C.green,"DP":C.amber,"Belum Bayar":"#FF7070",
  "Tinggi":"#FF7070","Sedang":C.amber,"Rendah":C.green,
};
function Badge({val}) {
  return <span style={{background:STATUS_COLORS[val]||C.bgCard2,color:STATUS_TEXT[val]||C.muted,fontSize:10,padding:"3px 9px",borderRadius:20,fontWeight:700,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>{val}</span>;
}
const CustomTip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return <div style={{background:C.bgCard2,border:`1px solid ${C.muted}44`,borderRadius:10,padding:"8px 12px"}}>
    <div style={{color:C.muted,fontSize:10,marginBottom:4}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{color:p.color,fontSize:12,fontWeight:700}}>{p.name}: {typeof p.value==="number"&&p.value>100000?fmt(p.value):p.value}</div>)}
  </div>;
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [events,   setEvents]   = useState(()=>load(KEYS.events,   DEF_EVENTS));
  const [checklist,setChecklist]= useState(()=>load(KEYS.checklist, DEF_CK));
  const [barang,   setBarang]   = useState(()=>load(KEYS.barang,   DEF_BARANG));
  const [rundown,  setRundown]  = useState(()=>load(KEYS.rundown,  DEF_RUNDOWN));
  const [rab,      setRab]      = useState(()=>load(KEYS.rab,      DEF_RAB));
  const [absensi,  setAbsensi]  = useState(()=>load(KEYS.absensi,  DEF_ABSENSI));

  // Auto-save setiap kali data berubah
  useEffect(()=>{ save(KEYS.events,   events);   },[events]);
  useEffect(()=>{ save(KEYS.checklist,checklist); },[checklist]);
  useEffect(()=>{ save(KEYS.barang,   barang);   },[barang]);
  useEffect(()=>{ save(KEYS.rundown,  rundown);  },[rundown]);
  useEffect(()=>{ save(KEYS.rab,      rab);      },[rab]);
  useEffect(()=>{ save(KEYS.absensi,  absensi);  },[absensi]);

  const TABS = [
    {id:"dashboard",icon:"📊",label:"Dashboard"},
    {id:"events",   icon:"📅",label:"Event"},
    {id:"checklist",icon:"✅",label:"Checklist"},
    {id:"barang",   icon:"🎒",label:"Barang"},
    {id:"rundown",  icon:"📋",label:"Rundown"},
    {id:"rab",      icon:"💰",label:"RAB"},
    {id:"absensi",  icon:"👶",label:"Absensi"},
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'DM Sans',sans-serif",color:C.text}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,select,textarea{outline:none}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#0a1929}
        ::-webkit-scrollbar-thumb{background:#2A5080;border-radius:4px}
        input:focus,select:focus{border-color:${C.emerald}!important}
      `}</style>

      {/* ── Header ── */}
      <div style={{background:`linear-gradient(135deg,${C.navy},#0F2235)`,borderBottom:`1px solid ${C.emerald}33`,padding:"14px 24px",position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:1280,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:24}}>🎈</span>
            <div>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:C.text}}>EO Balita Admin</div>
              <div style={{color:C.muted,fontSize:10}}>Powered by ClaudeHR · PT Javadwipa Duta Mandiri</div>
            </div>
          </div>
          <div style={{display:"flex",gap:4,background:C.bgCard,borderRadius:10,padding:4}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                background:tab===t.id?C.emerald:"transparent",
                color:tab===t.id?"#fff":C.muted,
                border:"none",borderRadius:7,padding:"7px 12px",
                fontSize:11,fontWeight:600,cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",transition:"all .2s",
                display:"flex",alignItems:"center",gap:4,
              }}><span>{t.icon}</span><span style={{display:window.innerWidth>768?"inline":"none"}}>{t.label}</span></button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{maxWidth:1280,margin:"0 auto",padding:"20px 24px"}}>
        {tab==="dashboard" && <DashboardTab events={events} checklist={checklist} barang={barang} rundown={rundown} rab={rab} absensi={absensi}/>}
        {tab==="events"    && <EventsTab    events={events} setEvents={setEvents}/>}
        {tab==="checklist" && <ChecklistTab checklist={checklist} setChecklist={setChecklist}/>}
        {tab==="barang"    && <BarangTab    barang={barang} setBarang={setBarang}/>}
        {tab==="rundown"   && <RundownTab   rundown={rundown} setRundown={setRundown}/>}
        {tab==="rab"       && <RabTab       rab={rab} setRab={setRab}/>}
        {tab==="absensi"   && <AbsensiTab   absensi={absensi} setAbsensi={setAbsensi}/>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD TAB
// ════════════════════════════════════════════════════════════════════════════
function DashboardTab({events,checklist,barang,rundown,rab,absensi}) {
  const totalEst   = rab.reduce((s,r)=>s+(r.qty*r.estimasi),0);
  const totalReal  = rab.reduce((s,r)=>s+(Number(r.realisasi)||0),0);
  const selisih    = totalEst - totalReal;
  const totalHadir = absensi.filter(a=>a.hadir==="Hadir").length;
  const ckSelesai  = checklist.filter(c=>c.status==="Selesai").length;
  const packDone   = barang.filter(b=>b.statusPack==="Sudah Pack").length;
  const eventDone  = events.filter(e=>e.status==="Done").length;

  const STATUS_LIST = ["Done","On Progress","Confirmed","Planning","Cancelled"];
  const PIE_COLORS  = [C.emerald,C.amber,"#2A5080","#6B7280","#DD4444"];
  const pieData = STATUS_LIST.map((s,i)=>({name:s,value:events.filter(e=>e.status===s).length,color:PIE_COLORS[i]}));

  const faseOrder = ["📋 H-14","📋 H-7","📋 H-3","📋 H-1","🎉 Hari-H","📊 H+1"];
  const ckBar = faseOrder.map(f=>({
    fase:f.replace("📋 ","").replace("🎉 ","").replace("📊 ",""),
    selesai:checklist.filter(c=>c.fase===f&&c.status==="Selesai").length,
    total:checklist.filter(c=>c.fase===f).length,
  }));

  const katList=["🏢 Venue","🎨 Bahan","🍱 F&B","🎁 Goodie Bag","👥 Tim","📣 Promosi"];
  const rabBar = katList.map(k=>({
    kat:k.replace(/^\S+ /,""),
    est:rab.filter(r=>r.kategori===k).reduce((s,r)=>s+(r.qty*r.estimasi),0),
    real:rab.filter(r=>r.kategori===k).reduce((s,r)=>s+(Number(r.realisasi)||0),0),
  }));

  const TIPES=["Sensory Class","Lomba","Cooking Date","Playdate","Craft Workshop","Lainnya"];
  const tipeBar = TIPES.map(t=>({tipe:t,jml:events.filter(e=>e.tipe===t).length})).filter(t=>t.jml>0);

  const insights = [
    {label:"✅ Completion Rate",val:`${pct(eventDone,events.length)||0}% event selesai dari ${events.length} terdaftar`},
    {label:"👶 Peserta Hadir",val:`${totalHadir} orang tercatat hadir`},
    {label:"💰 Status RAB",val:selisih>0?`SURPLUS ${fmt(selisih)} — efisien`:selisih<0?`DEFISIT ${fmt(-selisih)} — perlu evaluasi`:"BALANCE"},
    {label:"📋 Checklist",val:`${ckSelesai} / ${checklist.length} task selesai (${pct(ckSelesai,checklist.length)}%)`},
    {label:"🎒 Packing",val:`${packDone} item dikemas — ${barang.length-packDone} belum`},
    {label:"🏃 Rundown",val:`${rundown.filter(r=>r.status==="Selesai").length} selesai, ${rundown.filter(r=>r.status==="Belum").length} belum dimulai`},
  ];

  return (
    <div>
      {/* KPI Row 1 */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12,marginBottom:20}}>
        <KPICard icon="🎉" label="Total Event"    value={events.length}  sub={`${eventDone} selesai`}       accent={C.emerald}/>
        <KPICard icon="✅" label="Done"           value={eventDone}       sub="event selesai"                accent={C.emerald}/>
        <KPICard icon="⏳" label="On Progress"   value={events.filter(e=>e.status==="On Progress").length} sub="sedang berjalan" accent={C.amber}/>
        <KPICard icon="👶" label="Peserta Hadir" value={totalHadir}       sub="dari absensi"                accent="#60A5FA"/>
        <KPICard icon="✅" label="Task Selesai"  value={`${ckSelesai}/${checklist.length}`} sub="checklist" accent={C.emerald}/>
        <KPICard icon="🎒" label="Barang Pack"   value={`${packDone}/${barang.length}`}     sub="items"     accent={C.amber}/>
      </div>

      {/* KPI Row 2 - RAB */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        <KPICard icon="💵" label="Total Estimasi RAB" value={fmt(totalEst)}  sub="rencana anggaran" accent={C.emerald}/>
        <KPICard icon="💸" label="Total Realisasi"    value={fmt(totalReal)} sub="pengeluaran aktual" accent={C.amber}/>
        <KPICard icon="📊" label="Selisih"            value={fmt(Math.abs(selisih))} sub={selisih>=0?"Surplus — efisien":"Defisit — evaluasi"} accent={selisih>=0?C.emerald:"#FF7070"}/>
      </div>

      {/* Charts Row 1 */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <Card>
          <SectionTitle icon="🥧">Status Event</SectionTitle>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart><Pie data={pieData} cx={75} cy={75} innerRadius={45} outerRadius={72} dataKey="value" stroke="none">
                {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie></PieChart>
            </ResponsiveContainer>
            <div style={{flex:1}}>
              {pieData.map((s,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:10,height:10,borderRadius:3,background:s.color}}/>
                    <span style={{color:C.muted,fontSize:11}}>{s.name}</span>
                  </div>
                  <span style={{color:C.text,fontSize:12,fontWeight:700}}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle icon="📊" accent={C.amber}>Checklist per Fase</SectionTitle>
          <ResponsiveContainer width="100%" height={175}>
            <BarChart data={ckBar} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${C.muted}22`} vertical={false}/>
              <XAxis dataKey="fase" tick={{fill:C.muted,fontSize:9}} axisLine={false}/>
              <YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false}/>
              <Tooltip content={<CustomTip/>}/>
              <Legend wrapperStyle={{color:C.muted,fontSize:10}}/>
              <Bar dataKey="total"   name="Total"   fill={`${C.muted}55`} radius={[4,4,0,0]}/>
              <Bar dataKey="selesai" name="Selesai" fill={C.emerald}      radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:16,marginBottom:16}}>
        <Card>
          <SectionTitle icon="💰">RAB — Estimasi vs Realisasi</SectionTitle>
          <ResponsiveContainer width="100%" height={175}>
            <BarChart data={rabBar} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${C.muted}22`} vertical={false}/>
              <XAxis dataKey="kat" tick={{fill:C.muted,fontSize:9}} axisLine={false}/>
              <YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<CustomTip/>}/>
              <Legend wrapperStyle={{color:C.muted,fontSize:10}}/>
              <Bar dataKey="est"  name="Estimasi"  fill={C.emerald} radius={[4,4,0,0]}/>
              <Bar dataKey="real" name="Realisasi" fill={C.amber}   radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle icon="🎨" accent="#60A5FA">Tipe Event</SectionTitle>
          <ResponsiveContainer width="100%" height={175}>
            <BarChart data={tipeBar} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${C.muted}22`} horizontal={false}/>
              <XAxis type="number" tick={{fill:C.muted,fontSize:9}} axisLine={false}/>
              <YAxis dataKey="tipe" type="category" tick={{fill:C.muted,fontSize:9}} axisLine={false} width={80}/>
              <Tooltip content={<CustomTip/>}/>
              <Bar dataKey="jml" name="Jumlah" fill="#2A5080" radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Insight Box */}
      <Card>
        <SectionTitle icon="💡">Insight Otomatis</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {insights.map((ins,i)=>(
            <div key={i} style={{background:"#0F2235",borderRadius:10,padding:"10px 14px",border:`1px solid ${C.muted}22`,display:"flex",gap:10,alignItems:"center"}}>
              <div style={{flex:1}}>
                <div style={{color:C.muted,fontSize:10,marginBottom:2,fontWeight:700}}>{ins.label}</div>
                <div style={{color:C.green,fontSize:12}}>{ins.val}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// EVENTS TAB
// ════════════════════════════════════════════════════════════════════════════
function EventsTab({events,setEvents}) {
  const blank = {id:"",nama:"",tipe:"Sensory Class",tanggal:"",lokasi:"",kapasitas:"",pic:"",status:"Planning",catatan:""};
  const [form,setForm] = useState(blank);
  const [editId,setEditId] = useState(null);

  const TIPES=["Sensory Class","Lomba","Cooking Date","Playdate","Craft Workshop","Birthday Party","Lainnya"];
  const STATUSES=["Planning","Confirmed","On Progress","Done","Cancelled"];

  const genId = () => "EV-"+String(events.length+1).padStart(3,"0");

  const save = () => {
    if(!form.nama||!form.tanggal) return;
    if(editId) {
      setEvents(events.map(e=>e.id===editId?{...form,id:editId}:e));
    } else {
      setEvents([...events,{...form,id:genId()}]);
    }
    setForm(blank); setEditId(null);
  };
  const del = id => setEvents(events.filter(e=>e.id!==id));
  const edit = ev => { setForm(ev); setEditId(ev.id); };

  return (
    <div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:16}}>
      {/* Form */}
      <Card>
        <SectionTitle icon="📅">{editId?"Edit Event":"Tambah Event"}</SectionTitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["Nama Event","nama","text"],["Tanggal","tanggal","date"],["Lokasi","lokasi","text"],["Kapasitas Peserta","kapasitas","number"],["PIC Utama","pic","text"]].map(([lbl,key,type])=>(
            <div key={key}>
              <div style={{color:C.muted,fontSize:10,marginBottom:4,fontWeight:600}}>{lbl}</div>
              <input type={type} value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})} style={inputStyle} placeholder={lbl}/>
            </div>
          ))}
          <div>
            <div style={{color:C.muted,fontSize:10,marginBottom:4,fontWeight:600}}>Tipe Event</div>
            <select value={form.tipe} onChange={e=>setForm({...form,tipe:e.target.value})} style={selStyle}>
              {TIPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <div style={{color:C.muted,fontSize:10,marginBottom:4,fontWeight:600}}>Status</div>
            <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={selStyle}>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <div style={{color:C.muted,fontSize:10,marginBottom:4,fontWeight:600}}>Catatan</div>
            <textarea value={form.catatan||""} onChange={e=>setForm({...form,catatan:e.target.value})} style={{...inputStyle,minHeight:60,resize:"vertical"}} placeholder="Catatan event"/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={save} style={btnStyle(C.emerald)}>{editId?"💾 Update":"➕ Tambah"}</button>
            {editId&&<button onClick={()=>{setForm(blank);setEditId(null)}} style={btnStyle(C.muted)}>✕ Batal</button>}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"16px 18px 12px",borderBottom:`1px solid ${C.muted}22`}}>
          <SectionTitle icon="📋">Daftar Event ({events.length})</SectionTitle>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>{["ID","Nama","Tipe","Tanggal","Kapasitas","PIC","Status","Aksi"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {events.map((ev,i)=>(
                <tr key={ev.id} style={{background:i%2===0?"#0F2235":"#111D2E"}}>
                  <td style={tdStyle()}><span style={{color:C.muted,fontSize:10}}>{ev.id}</span></td>
                  <td style={tdStyle()}><div style={{fontWeight:600,fontSize:12}}>{ev.nama}</div><div style={{color:C.muted,fontSize:10}}>{ev.lokasi}</div></td>
                  <td style={{...tdStyle(),textAlign:"center"}}><span style={{color:C.muted,fontSize:11}}>{ev.tipe}</span></td>
                  <td style={{...tdStyle(),textAlign:"center",fontSize:11}}>{ev.tanggal}</td>
                  <td style={{...tdStyle(),textAlign:"center",fontWeight:700}}>{ev.kapasitas}</td>
                  <td style={{...tdStyle(),textAlign:"center",fontSize:11}}>{ev.pic}</td>
                  <td style={{...tdStyle(),textAlign:"center"}}><Badge val={ev.status}/></td>
                  <td style={{...tdStyle(),textAlign:"center"}}>
                    <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                      <button onClick={()=>edit(ev)} style={{...btnStyle("#2A5080"),padding:"4px 10px",fontSize:10}}>✏️</button>
                      <button onClick={()=>del(ev.id)} style={{...btnStyle("#4D1A1A"),padding:"4px 10px",fontSize:10}}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CHECKLIST TAB
// ════════════════════════════════════════════════════════════════════════════
function ChecklistTab({checklist,setChecklist}) {
  const FASES=["📋 H-14","📋 H-7","📋 H-3","📋 H-1","🎉 Hari-H","📊 H+1"];
  const blank={id:null,fase:"📋 H-14",task:"",pic:"",status:"Belum",prioritas:"Tinggi"};
  const [form,setForm]=useState(blank);
  const [editId,setEditId]=useState(null);

  const saveRow=()=>{
    if(!form.task) return;
    if(editId) setChecklist(checklist.map(c=>c.id===editId?{...form,id:editId}:c));
    else setChecklist([...checklist,{...form,id:Date.now()}]);
    setForm(blank); setEditId(null);
  };
  const updateStatus=(id,val)=>setChecklist(checklist.map(c=>c.id===id?{...c,status:val}:c));
  const del=id=>setChecklist(checklist.filter(c=>c.id!==id));

  const selesai=checklist.filter(c=>c.status==="Selesai").length;

  return (
    <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:16}}>
      <div>
        <Card style={{marginBottom:12}}>
          <SectionTitle icon="✅">{editId?"Edit Task":"Tambah Task"}</SectionTitle>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div>
              <div style={{color:C.muted,fontSize:10,marginBottom:4,fontWeight:600}}>Fase</div>
              <select value={form.fase} onChange={e=>setForm({...form,fase:e.target.value})} style={selStyle}>
                {FASES.map(f=><option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <div style={{color:C.muted,fontSize:10,marginBottom:4,fontWeight:600}}>Task</div>
              <input value={form.task} onChange={e=>setForm({...form,task:e.target.value})} style={inputStyle} placeholder="Nama task"/>
            </div>
            <div>
              <div style={{color:C.muted,fontSize:10,marginBottom:4,fontWeight:600}}>PIC</div>
              <input value={form.pic} onChange={e=>setForm({...form,pic:e.target.value})} style={inputStyle} placeholder="Nama PIC"/>
            </div>
            <div>
              <div style={{color:C.muted,fontSize:10,marginBottom:4,fontWeight:600}}>Prioritas</div>
              <select value={form.prioritas} onChange={e=>setForm({...form,prioritas:e.target.value})} style={selStyle}>
                {["Tinggi","Sedang","Rendah"].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={saveRow} style={btnStyle(C.emerald)}>{editId?"💾 Update":"➕ Tambah"}</button>
              {editId&&<button onClick={()=>{setForm(blank);setEditId(null)}} style={btnStyle(C.muted)}>✕</button>}
            </div>
          </div>
        </Card>
        <Card>
          <div style={{color:C.muted,fontSize:11,marginBottom:6}}>Progress Keseluruhan</div>
          <div style={{fontSize:24,fontWeight:800,fontFamily:"'Sora',sans-serif",color:C.green}}>{selesai}<span style={{color:C.muted,fontSize:14}}>/{checklist.length}</span></div>
          <div style={{background:"#0F2235",borderRadius:6,height:8,marginTop:8,overflow:"hidden"}}>
            <div style={{width:`${pct(selesai,checklist.length)}%`,height:"100%",background:C.emerald,borderRadius:6,transition:"width .5s"}}/>
          </div>
          <div style={{color:C.emerald,fontSize:11,marginTop:6}}>{pct(selesai,checklist.length)}% selesai</div>
        </Card>
      </div>

      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"16px 18px 12px",borderBottom:`1px solid ${C.muted}22`}}>
          <SectionTitle icon="📋">Semua Task Checklist</SectionTitle>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>{["Fase","Task","PIC","Prioritas","Status","Aksi"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {checklist.map((ck,i)=>(
                <tr key={ck.id} style={{background:i%2===0?"#0F2235":"#111D2E"}}>
                  <td style={{...tdStyle(),fontSize:10,whiteSpace:"nowrap"}}>{ck.fase}</td>
                  <td style={tdStyle()}><div style={{fontWeight:600,fontSize:12}}>{ck.task}</div></td>
                  <td style={{...tdStyle(),fontSize:11,textAlign:"center"}}>{ck.pic}</td>
                  <td style={{...tdStyle(),textAlign:"center"}}><Badge val={ck.prioritas}/></td>
                  <td style={{...tdStyle(),textAlign:"center"}}>
                    <select value={ck.status} onChange={e=>updateStatus(ck.id,e.target.value)}
                      style={{...selStyle,width:"auto",padding:"4px 8px",fontSize:10}}>
                      {["Belum","On Progress","Selesai","Skip"].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{...tdStyle(),textAlign:"center"}}>
                    <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                      <button onClick={()=>{setForm(ck);setEditId(ck.id)}} style={{...btnStyle("#2A5080"),padding:"4px 8px",fontSize:10}}>✏️</button>
                      <button onClick={()=>del(ck.id)} style={{...btnStyle("#4D1A1A"),padding:"4px 8px",fontSize:10}}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BARANG TAB
// ════════════════════════════════════════════════════════════════════════════
function BarangTab({barang,setBarang}) {
  const KATS=["📄 Administrasi","🎨 Aktivitas","🍳 Cooking Date","📸 Dokumentasi","🎁 Goodie Bag","🏥 P3K","🔌 Teknis","🎨 Dekorasi"];
  const blank={id:null,kategori:"📄 Administrasi",nama:"",satuan:"",jmlBawa:1,statusPack:"Belum Pack",kondisi:"Baik"};
  const [form,setForm]=useState(blank);
  const [editId,setEditId]=useState(null);

  const saveRow=()=>{
    if(!form.nama) return;
    if(editId) setBarang(barang.map(b=>b.id===editId?{...form,id:editId}:b));
    else setBarang([...barang,{...form,id:Date.now()}]);
    setForm(blank); setEditId(null);
  };
  const updatePack=(id,val)=>setBarang(barang.map(b=>b.id===id?{...b,statusPack:val}:b));
  const del=id=>setBarang(barang.filter(b=>b.id!==id));
  const packAll=()=>setBarang(barang.map(b=>({...b,statusPack:"Sudah Pack"})));

  return (
    <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:16}}>
      <div>
        <Card style={{marginBottom:12}}>
          <SectionTitle icon="🎒">{editId?"Edit Barang":"Tambah Barang"}</SectionTitle>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div>
              <div style={{color:C.muted,fontSize:10,marginBottom:4,fontWeight:600}}>Kategori</div>
              <select value={form.kategori} onChange={e=>setForm({...form,kategori:e.target.value})} style={selStyle}>
                {KATS.map(k=><option key={k}>{k}</option>)}
              </select>
            </div>
            {[["Nama Barang","nama","text"],["Satuan","satuan","text"],["Jumlah Bawa","jmlBawa","number"]].map(([lbl,key,type])=>(
              <div key={key}>
                <div style={{color:C.muted,fontSize:10,marginBottom:4,fontWeight:600}}>{lbl}</div>
                <input type={type} value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})} style={inputStyle} placeholder={lbl}/>
              </div>
            ))}
            <div>
              <div style={{color:C.muted,fontSize:10,marginBottom:4,fontWeight:600}}>Status Pack</div>
              <select value={form.statusPack} onChange={e=>setForm({...form,statusPack:e.target.value})} style={selStyle}>
                {["Belum Pack","Sudah Pack","Tiba di Venue","Rusak/Kurang"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={saveRow} style={btnStyle(C.emerald)}>{editId?"💾 Update":"➕ Tambah"}</button>
              {editId&&<button onClick={()=>{setForm(blank);setEditId(null)}} style={btnStyle(C.muted)}>✕</button>}
            </div>
          </div>
        </Card>
        <Card>
          <button onClick={packAll} style={{...btnStyle(C.emerald),width:"100%",marginBottom:10}}>✅ Pack Semua</button>
          <div style={{color:C.muted,fontSize:11}}>Sudah Pack: <strong style={{color:C.green}}>{barang.filter(b=>b.statusPack==="Sudah Pack").length}</strong> / {barang.length}</div>
        </Card>
      </div>

      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"16px 18px 12px",borderBottom:`1px solid ${C.muted}22`}}>
          <SectionTitle icon="📦">Inventaris Barang ({barang.length} item)</SectionTitle>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>{["Kategori","Nama Barang","Satuan","Jml","Status Pack","Aksi"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {barang.map((b,i)=>(
                <tr key={b.id} style={{background:i%2===0?"#0F2235":"#111D2E"}}>
                  <td style={{...tdStyle(),fontSize:10}}>{b.kategori}</td>
                  <td style={tdStyle()}><div style={{fontWeight:600,fontSize:12}}>{b.nama}</div></td>
                  <td style={{...tdStyle(),textAlign:"center",fontSize:11}}>{b.satuan}</td>
                  <td style={{...tdStyle(),textAlign:"center",fontWeight:700}}>{b.jmlBawa}</td>
                  <td style={{...tdStyle(),textAlign:"center"}}>
                    <select value={b.statusPack} onChange={e=>updatePack(b.id,e.target.value)}
                      style={{...selStyle,width:"auto",padding:"4px 8px",fontSize:10}}>
                      {["Belum Pack","Sudah Pack","Tiba di Venue","Rusak/Kurang"].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{...tdStyle(),textAlign:"center"}}>
                    <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                      <button onClick={()=>{setForm(b);setEditId(b.id)}} style={{...btnStyle("#2A5080"),padding:"4px 8px",fontSize:10}}>✏️</button>
                      <button onClick={()=>del(b.id)} style={{...btnStyle("#4D1A1A"),padding:"4px 8px",fontSize:10}}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RUNDOWN TAB
// ════════════════════════════════════════════════════════════════════════════
function RundownTab({rundown,setRundown}) {
  const blank={id:null,waktuMulai:"",waktuSelesai:"",durasi:0,sesi:"",pic:"",status:"Belum"};
  const [form,setForm]=useState(blank);
  const [editId,setEditId]=useState(null);

  const saveRow=()=>{
    if(!form.sesi) return;
    if(editId) setRundown(rundown.map(r=>r.id===editId?{...form,id:editId}:r));
    else setRundown([...rundown,{...form,id:Date.now()}]);
    setForm(blank); setEditId(null);
  };
  const updateStatus=(id,val)=>setRundown(rundown.map(r=>r.id===id?{...r,status:val}:r));
  const del=id=>setRundown(rundown.filter(r=>r.id!==id));

  return (
    <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:16}}>
      <Card>
        <SectionTitle icon="📋">{editId?"Edit Sesi":"Tambah Sesi"}</SectionTitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["Waktu Mulai","waktuMulai","time"],["Waktu Selesai","waktuSelesai","time"],["Durasi (menit)","durasi","number"],["Nama Sesi","sesi","text"],["PIC","pic","text"]].map(([lbl,key,type])=>(
            <div key={key}>
              <div style={{color:C.muted,fontSize:10,marginBottom:4,fontWeight:600}}>{lbl}</div>
              <input type={type} value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})} style={inputStyle} placeholder={lbl}/>
            </div>
          ))}
          <div style={{display:"flex",gap:8}}>
            <button onClick={saveRow} style={btnStyle(C.emerald)}>{editId?"💾 Update":"➕ Tambah"}</button>
            {editId&&<button onClick={()=>{setForm(blank);setEditId(null)}} style={btnStyle(C.muted)}>✕</button>}
          </div>
        </div>
      </Card>

      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"16px 18px 12px",borderBottom:`1px solid ${C.muted}22`}}>
          <SectionTitle icon="🕐">Timeline Rundown ({rundown.length} sesi)</SectionTitle>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>{["Mulai","Selesai","Durasi","Sesi/Kegiatan","PIC","Status","Aksi"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rundown.map((r,i)=>(
                <tr key={r.id} style={{background:i%2===0?"#0F2235":"#111D2E"}}>
                  <td style={{...tdStyle(),textAlign:"center",fontWeight:700,color:C.amber}}>{r.waktuMulai}</td>
                  <td style={{...tdStyle(),textAlign:"center",fontSize:11}}>{r.waktuSelesai}</td>
                  <td style={{...tdStyle(),textAlign:"center",fontSize:11}}>{r.durasi}m</td>
                  <td style={tdStyle()}><div style={{fontWeight:600,fontSize:12}}>{r.sesi}</div></td>
                  <td style={{...tdStyle(),textAlign:"center",fontSize:11}}>{r.pic}</td>
                  <td style={{...tdStyle(),textAlign:"center"}}>
                    <select value={r.status} onChange={e=>updateStatus(r.id,e.target.value)}
                      style={{...selStyle,width:"auto",padding:"4px 8px",fontSize:10}}>
                      {["Belum","On Progress","Selesai"].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{...tdStyle(),textAlign:"center"}}>
                    <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                      <button onClick={()=>{setForm(r);setEditId(r.id)}} style={{...btnStyle("#2A5080"),padding:"4px 8px",fontSize:10}}>✏️</button>
                      <button onClick={()=>del(r.id)} style={{...btnStyle("#4D1A1A"),padding:"4px 8px",fontSize:10}}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RAB TAB
// ════════════════════════════════════════════════════════════════════════════
function RabTab({rab,setRab}) {
  const KATS=["🏢 Venue","🎨 Bahan","🍱 F&B","🎁 Goodie Bag","👥 Tim","📣 Promosi","🖨️ Cetak","🚗 Transport","🔌 Teknis","🏥 P3K"];
  const blank={id:null,kategori:"🏢 Venue",deskripsi:"",satuan:"",qty:1,estimasi:0,realisasi:0};
  const [form,setForm]=useState(blank);
  const [editId,setEditId]=useState(null);

  const saveRow=()=>{
    if(!form.deskripsi) return;
    if(editId) setRab(rab.map(r=>r.id===editId?{...form,id:editId}:r));
    else setRab([...rab,{...form,id:Date.now()}]);
    setForm(blank); setEditId(null);
  };
  const updateReal=(id,val)=>setRab(rab.map(r=>r.id===id?{...r,realisasi:Number(val)||0}:r));
  const del=id=>setRab(rab.filter(r=>r.id!==id));

  const totEst=rab.reduce((s,r)=>s+(r.qty*r.estimasi),0);
  const totReal=rab.reduce((s,r)=>s+(Number(r.realisasi)||0),0);
  const sel=totEst-totReal;

  return (
    <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:16}}>
      <div>
        <Card style={{marginBottom:12}}>
          <SectionTitle icon="💰">{editId?"Edit Item RAB":"Tambah Item RAB"}</SectionTitle>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div>
              <div style={{color:C.muted,fontSize:10,marginBottom:4,fontWeight:600}}>Kategori</div>
              <select value={form.kategori} onChange={e=>setForm({...form,kategori:e.target.value})} style={selStyle}>
                {KATS.map(k=><option key={k}>{k}</option>)}
              </select>
            </div>
            {[["Deskripsi","deskripsi","text"],["Satuan","satuan","text"],["Qty","qty","number"],["Estimasi (Rp)","estimasi","number"],["Realisasi (Rp)","realisasi","number"]].map(([lbl,key,type])=>(
              <div key={key}>
                <div style={{color:C.muted,fontSize:10,marginBottom:4,fontWeight:600}}>{lbl}</div>
                <input type={type} value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})} style={inputStyle} placeholder={lbl}/>
              </div>
            ))}
            <div style={{display:"flex",gap:8}}>
              <button onClick={saveRow} style={btnStyle(C.emerald)}>{editId?"💾 Update":"➕ Tambah"}</button>
              {editId&&<button onClick={()=>{setForm(blank);setEditId(null)}} style={btnStyle(C.muted)}>✕</button>}
            </div>
          </div>
        </Card>
        <Card>
          <div style={{marginBottom:8}}>
            <div style={{color:C.muted,fontSize:10,marginBottom:2}}>Total Estimasi</div>
            <div style={{color:C.green,fontSize:16,fontWeight:800,fontFamily:"'Sora',sans-serif"}}>{fmt(totEst)}</div>
          </div>
          <div style={{marginBottom:8}}>
            <div style={{color:C.muted,fontSize:10,marginBottom:2}}>Total Realisasi</div>
            <div style={{color:C.amber,fontSize:16,fontWeight:800,fontFamily:"'Sora',sans-serif"}}>{fmt(totReal)}</div>
          </div>
          <div style={{borderTop:`1px solid ${C.muted}33`,paddingTop:8}}>
            <div style={{color:C.muted,fontSize:10,marginBottom:2}}>Selisih</div>
            <div style={{color:sel>=0?C.green:"#FF7070",fontSize:16,fontWeight:800,fontFamily:"'Sora',sans-serif"}}>{sel>=0?"+":""}{fmt(sel)}</div>
          </div>
        </Card>
      </div>

      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"16px 18px 12px",borderBottom:`1px solid ${C.muted}22`}}>
          <SectionTitle icon="📊">Rencana Anggaran Belanja</SectionTitle>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>{["Kategori","Deskripsi","Satuan","Qty","Estimasi","Total Est","Realisasi (edit)","Selisih","Aksi"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rab.map((r,i)=>{
                const totEst_=r.qty*r.estimasi;
                const real_=Number(r.realisasi)||0;
                const sel_=totEst_-real_;
                return (
                  <tr key={r.id} style={{background:i%2===0?"#0F2235":"#111D2E"}}>
                    <td style={{...tdStyle(),fontSize:10}}>{r.kategori}</td>
                    <td style={tdStyle()}><div style={{fontWeight:600,fontSize:12}}>{r.deskripsi}</div></td>
                    <td style={{...tdStyle(),textAlign:"center",fontSize:11}}>{r.satuan}</td>
                    <td style={{...tdStyle(),textAlign:"center",fontWeight:700}}>{r.qty}</td>
                    <td style={{...tdStyle(),textAlign:"right",fontSize:11}}>{Number(r.estimasi).toLocaleString("id-ID")}</td>
                    <td style={{...tdStyle(),textAlign:"right",fontWeight:700,color:C.green}}>{totEst_.toLocaleString("id-ID")}</td>
                    <td style={{...tdStyle(),textAlign:"center"}}>
                      <input type="number" value={r.realisasi||0} onChange={e=>updateReal(r.id,e.target.value)}
                        style={{...inputStyle,width:110,textAlign:"right",padding:"4px 8px"}}/>
                    </td>
                    <td style={{...tdStyle(),textAlign:"right",fontWeight:700,color:sel_>=0?C.green:"#FF7070"}}>{sel_>=0?"+":""}{sel_.toLocaleString("id-ID")}</td>
                    <td style={{...tdStyle(),textAlign:"center"}}>
                      <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                        <button onClick={()=>{setForm(r);setEditId(r.id)}} style={{...btnStyle("#2A5080"),padding:"4px 8px",fontSize:10}}>✏️</button>
                        <button onClick={()=>del(r.id)} style={{...btnStyle("#4D1A1A"),padding:"4px 8px",fontSize:10}}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ABSENSI TAB
// ════════════════════════════════════════════════════════════════════════════
function AbsensiTab({absensi,setAbsensi}) {
  const addRow=()=>setAbsensi([...absensi,{id:Date.now(),namaAnak:"",usia:"",namaOrtu:"",noHp:"",statusBayar:"Belum Bayar",hadir:"Belum",catatan:""}]);
  const del=id=>setAbsensi(absensi.filter(a=>a.id!==id));
  const update=(id,key,val)=>setAbsensi(absensi.map(a=>a.id===id?{...a,[key]:val}:a));

  const hadir=absensi.filter(a=>a.hadir==="Hadir").length;
  const lunas=absensi.filter(a=>a.statusBayar==="Lunas").length;

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
        <KPICard icon="👶" label="Total Peserta"   value={absensi.filter(a=>a.namaAnak).length} sub="terdaftar"  accent={C.emerald}/>
        <KPICard icon="✅" label="Hadir"           value={hadir}   sub="peserta hadir"           accent={C.green}/>
        <KPICard icon="💰" label="Lunas"           value={lunas}   sub="sudah bayar"             accent={C.amber}/>
        <KPICard icon="📊" label="Kehadiran"       value={`${pct(hadir,absensi.filter(a=>a.namaAnak).length||1)}%`} sub="dari terdaftar" accent={C.emerald}/>
      </div>

      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"16px 18px 12px",borderBottom:`1px solid ${C.muted}22`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <SectionTitle icon="📝">Daftar Peserta</SectionTitle>
          <button onClick={addRow} style={btnStyle(C.emerald)}>➕ Tambah Peserta</button>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>{["No","Nama Anak","Usia","Nama Ortu","No HP","Status Bayar","Hadir","Catatan/Alergi","Aksi"].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {absensi.map((a,i)=>(
                <tr key={a.id} style={{background:i%2===0?"#0F2235":"#111D2E"}}>
                  <td style={{...tdStyle(),textAlign:"center",color:C.muted,fontSize:11}}>{i+1}</td>
                  <td style={tdStyle()}>
                    <input value={a.namaAnak} onChange={e=>update(a.id,"namaAnak",e.target.value)} style={{...inputStyle,padding:"4px 8px"}} placeholder="Nama anak"/>
                  </td>
                  <td style={tdStyle()}>
                    <input value={a.usia} onChange={e=>update(a.id,"usia",e.target.value)} style={{...inputStyle,padding:"4px 8px",width:60}} placeholder="bln"/>
                  </td>
                  <td style={tdStyle()}>
                    <input value={a.namaOrtu} onChange={e=>update(a.id,"namaOrtu",e.target.value)} style={{...inputStyle,padding:"4px 8px"}} placeholder="Nama orang tua"/>
                  </td>
                  <td style={tdStyle()}>
                    <input value={a.noHp} onChange={e=>update(a.id,"noHp",e.target.value)} style={{...inputStyle,padding:"4px 8px"}} placeholder="08xx"/>
                  </td>
                  <td style={{...tdStyle(),textAlign:"center"}}>
                    <select value={a.statusBayar} onChange={e=>update(a.id,"statusBayar",e.target.value)}
                      style={{...selStyle,width:"auto",padding:"4px 8px",fontSize:10}}>
                      {["Lunas","DP","Belum Bayar","Free/Undangan"].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{...tdStyle(),textAlign:"center"}}>
                    <select value={a.hadir} onChange={e=>update(a.id,"hadir",e.target.value)}
                      style={{...selStyle,width:"auto",padding:"4px 8px",fontSize:10}}>
                      {["Belum","Hadir","Tidak Hadir","Izin"].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={tdStyle()}>
                    <input value={a.catatan} onChange={e=>update(a.id,"catatan",e.target.value)} style={{...inputStyle,padding:"4px 8px"}} placeholder="alergi, catatan..."/>
                  </td>
                  <td style={{...tdStyle(),textAlign:"center"}}>
                    <button onClick={()=>del(a.id)} style={{...btnStyle("#4D1A1A"),padding:"4px 8px",fontSize:10}}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
