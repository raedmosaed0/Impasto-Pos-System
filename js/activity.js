/* Impasto POS — Staff activity log, formatting helpers */
function logAct(t,d,a){db.log.push({ts:Date.now(),by:CONFIG.cashier,t:t,d:d||"",a:a});if(db.log.length>400)db.log.splice(0,db.log.length-400)}
function fmtWhen(ts){var d=new Date(ts),t=d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});return d.toDateString()===new Date().toDateString()?t:d.toLocaleDateString([],{day:"numeric",month:"short"})+", "+t}
function startShift(name){
  if(name===CONFIG.cashier)return;
  logAct("handover","Handed over to "+name);
  CONFIG.cashier=name;db.set=db.set||{};db.set.cashier=name;db.shift={ts:Date.now()};
  logAct("shift","Shift started");save();updateKpis();
}
function money(n){return CONFIG.currency+(CONFIG.currency.length>1?" ":"")+(Math.round(n*100)/100).toFixed(2)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function toast(t){var el=$("toast");el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){el.hidden=true},2600)}
