/* Náhled k připomínkování: napodobí Supabase v paměti s ukázkovými daty.
   Skutečná aplikace tento soubor nepoužívá. */
(function(){
  const SAMPLE=__SAMPLE__;
  let role="coach";try{role=localStorage.getItem("nahled-role")||"coach"}catch(e){}
  const PID="hracka-ukazka";
  const D={
    players:[{id:"trener",name:"Trenér",since:"2026-11-01",is_coach:true},{id:PID,name:"Ukázková hráčka",since:"2026-11-02",is_coach:false}],
    entries:[]
  };
  for(const [k,v] of Object.entries(SAMPLE.days))D.entries.push({owner:PID,kind:"days",key:k,data:v});
  for(const [k,v] of Object.entries(SAMPLE.weeks))D.entries.push({owner:PID,kind:"weeks",key:k,data:v});
  const subs=[];const notify=()=>setTimeout(()=>subs.forEach(f=>{try{f()}catch(e){}}),0);
  function qb(table){
    const st={op:"select",f:[],p:null};
    const exec=()=>{const m=r=>st.f.every(([c,v])=>r[c]===v);
      if(st.op==="select")return {data:D[table].filter(m).map(r=>JSON.parse(JSON.stringify(r))),error:null};
      if(st.op==="insert"){D[table].push(Object.assign({},st.p));notify();return {error:null}}
      if(st.op==="upsert"){const p=st.p,i=D.entries.findIndex(r=>r.owner===p.owner&&r.kind===p.kind&&r.key===p.key);if(i>=0)D.entries[i]=p;else D.entries.push(p);notify();return {error:null}}
      if(st.op==="update"){D[table].filter(m).forEach(r=>Object.assign(r,st.p));notify();return {error:null}}
      if(st.op==="delete"){D[table]=D[table].filter(r=>!m(r));notify();return {error:null}}};
    const b={select(){return b},eq(c,v){st.f.push([c,v]);return b},
      insert(p){st.op="insert";st.p=p;return b},upsert(p){st.op="upsert";st.p=p;return b},
      update(p){st.op="update";st.p=p;return b},delete(){st.op="delete";return b},
      maybeSingle(){const r=exec();return Promise.resolve({data:r.data[0]||null,error:null})},
      then(res,rej){return Promise.resolve(exec()).then(res,rej)}};
    return b;
  }
  const session={user:{id:role==="player"?PID:"trener"}};
  window.DENIK_CONFIG={supabaseUrl:"nahled",supabaseAnonKey:"nahled"};
  window.supabase={createClient(){return {
    from:qb,
    channel(){const ch={on(a,b,cb){subs.push(cb);return ch},subscribe(){return ch}};return ch},
    removeChannel(){},
    auth:{onAuthStateChange(){},getSession(){return Promise.resolve({data:{session}})},
      signInWithOtp(){return Promise.resolve({error:null})},verifyOtp(){return Promise.resolve({error:null})},
      signOut(){return Promise.resolve({})}}
  }}};
  window.__nahledRole=role;
})();
