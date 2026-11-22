/* Impasto POS — Staff account page */
var stName="", stList=[], LOGM={order:["orders","Order completed"],hold:["pause","Order held"],clear:["trash","Order cleared"],free:["table","Table freed"],deliv:["truck","Delivery updated"],shift:["play","Shift started"],handover:["logout","Shift ended"],day:["calendar","Day closed"],csv:["file","CSV exported"]};
function fmtDur(ms){var m=Math.max(0,Math.floor(ms/60000)),h=Math.floor(m/60);return h?h+"h "+(m%60)+"m":m+"m"}
function staffNames(){var n=[CONFIG.cashier];db.emp.forEach(function(x){n.push(x.name)});Object.keys(db.cs).forEach(function(k){n.push(k)});return n.filter(function(x,i){return x&&n.indexOf(x)===i})}
function staffStats(name){
  var r={n:0,s:0,items:0,disc:0,cash:0,other:0};
  db.orders.forEach(function(o){if(o.cashier!==name)return;var b=breakdown(o);
    r.n++;r.s+=o.total;r.disc+=o.disc||0;r.cash+=b.Cash;r.other+=b.Card+b.Online;o.items.forEach(function(i){r.items+=i.qty})});
  return r;
}
function openStaff(name){if(!name)return;needPin(name,function(){stName=name;go("staff")})}
function renderStaff(){
  var name=stName||CONFIG.cashier;stName=name;
  stList=staffNames();if(stList.indexOf(name)<0)stList.push(name);
  $("stPick").innerHTML=stList.map(function(n,i){return '<button data-p="'+i+'" class="'+(n===name?'on ':'')+(n===CONFIG.cashier?'live':'')+'">'+esc(n)+'</button>'}).join("");
  var e=null;db.emp.forEach(function(x){if(x.name===name)e=x});
  var on=CONFIG.cashier===name,st=staffStats(name),all=db.cs[name]||{n:0,s:0,last:0};
  $("stAv").innerHTML=avHTML(name);$("stName").textContent=name;
  $("stSub").textContent=[e?e.role:"Cashier",e&&e.phone,all.last?"Last order "+fmtWhen(all.last):""].filter(Boolean).join(" · ");
  $("stState").textContent=on?"On shift · "+fmtDur(Date.now()-db.shift.ts)+" (since "+fmtWhen(db.shift.ts)+")":"Off shift";
  $("stState").className="stpill"+(on?" live":"");
  $("stUse").hidden=on;$("stPhotoRm").hidden=!db.photos[name];
  $("stKpis").innerHTML=[["Orders today",st.n],["Sales today",money(st.s)],["Average order",money(st.n?st.s/st.n:0)],["Items sold",st.items],["Discounts given",money(st.disc)],["Cash collected",money(st.cash)],["Visa & transfer",money(st.other)],["All time",money(all.s),all.n+(all.n===1?" order":" orders")]].map(function(k,i){return '<div class="kpi">'+k[0]+'<b>'+k[1]+'</b>'+(k[2]?'<small>'+k[2]+'</small>':'')+'</div>'}).join("");
  var mine=db.orders.filter(function(o){return o.cashier===name}).reverse();
  $("stOrders").innerHTML=mine.length?mine.map(function(o){return '<button type="button" class="strow" data-inv="'+o.no+'"><b class="no">#'+o.no+'</b><span><i class="ty" style="background:'+(TCOL[o.type]||"#b5527a")+'"></i>'+esc(o.type)+(o.ref?' · '+esc(o.ref):'')+'<small>'+new Date(o.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+'</small></span><span class="pm">'+esc(payLabel(o))+'</span><em>'+money(o.total)+'</em></button>'}).join(""):'<div class="none">No orders yet today.</div>';
  $("stOrdN").textContent=mine.length;$("stOrdN").hidden=!mine.length;
  var pr={};mine.forEach(function(o){o.items.forEach(function(i){pr[i.name]=(pr[i.name]||0)+i.qty})});
  $("stTop").innerHTML=hbars(Object.keys(pr).map(function(k){return {n:k,v:pr[k],t:pr[k]+" sold"}}).sort(function(a,b){return b.v-a.v}).slice(0,5));
  var rows=db.log.filter(function(x){return x.by===name}).slice(-100).reverse();
  var LOGC={order:"#2f7d4f",hold:"#e0a526",clear:"#d94a1a",free:"#3a7ca5",deliv:"#3a7ca5",shift:"#2f7d4f",handover:"#8a6f60",day:"#b5527a",csv:"#8a6f60"},lastDay="";
  var dayLbl=function(ts){var d=new Date(ts),t=new Date(),y=new Date(Date.now()-864e5);
    return d.toDateString()===t.toDateString()?"Today":d.toDateString()===y.toDateString()?"Yesterday":d.toLocaleDateString([],{weekday:"short",day:"numeric",month:"short"})};
  $("stLog").innerHTML=rows.length?rows.map(function(x){var m=LOGM[x.t]||["dot",x.t],c=LOGC[x.t]||"#8a6f60",dl=dayLbl(x.ts),head="";
    if(dl!==lastDay){lastDay=dl;head='<div class="tld">'+dl+'</div>'}
    var det=x.d&&x.d!==m[1]?x.d:"";
    return head+'<div class="tli"><i style="color:'+c+';background:color-mix(in srgb,'+c+' 15%,#fff)">'+ic(m[0])+'</i><div><b>'+m[1]+'</b>'+(det?'<small>'+esc(det)+'</small>':'')+'</div><div class="tr">'+(x.a!=null?'<b>'+money(x.a)+'</b>':'')+'<small>'+new Date(x.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+'</small></div></div>'}).join("")
    :'<div class="none">No activity yet. Completed orders and other actions will appear here.</div>';
}
$("stPick").onclick=function(e){var b=e.target.closest("[data-p]");if(!b)return;var n=stList[+b.dataset.p];if(n===stName)return;needPin(n,function(){stName=n;renderStaff()})};
$("stPhoto").onclick=function(){$("stFile").click()};
$("stPhotoRm").onclick=function(){delete db.photos[stName];save();renderStaff();updateKpis();toast("Photo removed")};
$("stFile").onchange=function(){var f=this.files[0];this.value="";if(!f)return;var r=new FileReader();
  r.onload=function(){var im=new Image();
    im.onload=function(){var z=Math.min(im.width,im.height),c=document.createElement("canvas");c.width=c.height=192;
      c.getContext("2d").drawImage(im,(im.width-z)/2,(im.height-z)/2,z,z,0,0,192,192);
      db.photos[stName]=c.toDataURL("image/jpeg",.82);save();renderStaff();updateKpis();toast("Photo updated")};
    im.onerror=function(){toast("Couldn't read that image.")};im.src=r.result};
  r.readAsDataURL(f)};
$("stPw").onclick=function(){$("pwOld").value="";$("pwNew").value="";$("pwErr").hidden=true;
  $("pwOld").parentNode.style.display=hasPin(stName)?"":"none";$("pwDlg").showModal();$((hasPin(stName)?"pwOld":"pwNew")).focus()};
$("pwCancel").onclick=function(){$("pwDlg").close()};
$("pwSave").onclick=function(){
  var e=$("pwErr"),np=$("pwNew").value;e.hidden=false;
  checkPin(stName,$("pwOld").value).then(function(ok){
    if(!ok){e.textContent="Current password is wrong.";return}
    if(np.length<4){e.textContent="New password must be at least 4 characters.";return}
    setPin(stName,np).then(function(){$("pwDlg").close();toast("Password changed for "+stName)});
  });
};
function renameStaff(o,n){
  if(db.pins[o])db.pins[n]=db.pins[o];delete db.pins[o];
  if(db.photos[o]){db.photos[n]=db.photos[o];delete db.photos[o]}
  if(db.cs[o]){db.cs[n]=db.cs[o];delete db.cs[o]}
  db.emp.forEach(function(x){if(x.name===o)x.name=n});
  db.orders.forEach(function(x){if(x.cashier===o)x.cashier=n});
  db.log.forEach(function(x){if(x.by===o)x.by=n});
  if(CONFIG.cashier===o){CONFIG.cashier=n;db.set=db.set||{};db.set.cashier=n}
  stName=n;save();
}
$("stNm").onclick=function(){$("nmIn").value=stName;$("nmDlg").showModal();$("nmIn").focus();$("nmIn").select()};
$("nmCancel").onclick=function(){$("nmDlg").close()};
$("nmSave").onclick=function(){var n=$("nmIn").value.trim();
  if(!n)return toast("The name can't be empty.");
  if(n===stName){$("nmDlg").close();return}
  if(staffNames().indexOf(n)>=0)return toast("That name is already used.");
  renameStaff(stName,n);$("nmDlg").close();renderStaff();updateKpis();toast("Name updated")};
$("nmDlg").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();$("nmSave").click()}});
$("pinOk").onclick=pinTry;
$("pinCancel").onclick=function(){pinCb=null;$("pinDlg").close()};
$("pinIn").onkeydown=function(e){if(e.key==="Enter"){e.preventDefault();pinTry()}};
$("pwDlg").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();$("pwSave").click()}});
$("stOrders").onclick=function(e){var b=e.target.closest("[data-inv]");if(!b)return;
  $("oSearch").value="#"+b.dataset.inv;$("oPay").value="All";oType="All";go("orders")};
$("stUse").onclick=function(){startShift(stName);toast(stName+" is now on shift");renderStaff()};
$("me").onclick=function(e){if(e.target.closest(".icon-btn,.dd"))return;openStaff(CONFIG.cashier)};
