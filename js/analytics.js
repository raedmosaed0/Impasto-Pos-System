/* Impasto POS — Analytics */
var PCOL={Cash:"#2f7d4f",Card:"#3a7ca5",Online:"#e0a526"},TCOL={"Dine-in":"#f05a28",Takeaway:"#e0a526",Delivery:"#3a7ca5"};
function localDate(d){var p=function(n){return (n<10?"0":"")+n};return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())}
function closeDaySummary(){
  if(!db.orders.length)return;
  var t=0;db.orders.forEach(function(o){t+=o.total});
  logAct("day","Closed the day · "+db.orders.length+(db.orders.length===1?" order":" orders"),t);
  var d=localDate(new Date()),last=db.days[db.days.length-1];
  if(last&&last.d===d){last.n+=db.orders.length;last.s+=t}else db.days.push({d:d,n:db.orders.length,s:t});
  if(db.days.length>60)db.days.shift();
}
function bar(val,max,label,color){
  var h=max?Math.round(val/max*120):0;
  return '<div class="bar'+(val?'':' zero')+'" title="'+esc(label)+': '+money(val)+'"><em>'+(val?CONFIG.currency+Math.round(val):'')+'</em><i style="height:'+Math.max(h,2)+'px'+(color?';background:'+color:'')+'"></i><span>'+esc(label)+'</span></div>';
}
function hbars(rows){
  if(!rows.length)return '<div class="none">No sales yet today.</div>';
  var max=Math.max.apply(null,rows.map(function(r){return r.v}))||1;
  return rows.map(function(r){return '<div class="hrow"><span class="hl" title="'+esc(r.n)+'">'+esc(r.n)+'</span><div class="ht"><i style="width:'+Math.max(3,Math.round(r.v/max*100))+'%"></i></div><b>'+r.t+'</b></div>'}).join("");
}
function donut(parts,center){
  var tot=0;parts.forEach(function(p){tot+=p.v});
  if(!tot)return '<div class="none" style="width:100%">No sales yet today.</div>';
  var acc=0,stops=parts.filter(function(p){return p.v>0}).map(function(p){var a=acc/tot*100;acc+=p.v;return p.c+" "+a.toFixed(2)+"% "+(acc/tot*100).toFixed(2)+"%"}).join(",");
  return '<div class="donut" style="background:conic-gradient('+stops+')"><b>'+center+'</b></div><ul class="lgd">'+parts.map(function(p){return '<li><i style="background:'+p.c+'"></i><span>'+esc(p.n)+'</span><b>'+Math.round(p.v/tot*100)+'%</b></li>'}).join("")+'</ul>';
}
function renderAnalytics(){
  var all=0,items=0,hours={},bd={Cash:0,Card:0,Online:0},types={},cats={},prod={},cmap={};
  MENU.forEach(function(m){cmap[m.name]=m.cat});
  db.orders.forEach(function(o){
    all+=o.total;
    var h=new Date(o.ts).getHours();hours[h]=(hours[h]||0)+o.total;
    var b=breakdown(o);bd.Cash+=b.Cash;bd.Card+=b.Card;bd.Online+=b.Online;
    types[o.type]=(types[o.type]||0)+o.total;
    o.items.forEach(function(i){
      items+=i.qty;var c=cmap[i.name]||"Other";cats[c]=(cats[c]||0)+i.price*i.qty;
      var p=prod[i.name]||(prod[i.name]={q:0,r:0});p.q+=i.qty;p.r+=i.price*i.qty;
    });
  });
  var n=db.orders.length,hk=Object.keys(hours).map(Number),peak=null;
  hk.forEach(function(h){if(peak===null||hours[h]>hours[peak])peak=h});
  var pad=function(x){return (x<10?"0":"")+x};
  $("anKpis").innerHTML=[["Revenue",money(all)],["Orders",n],["Average order",money(n?all/n:0)],["Items sold",items],["Items per order",n?(items/n).toFixed(1):"0"],["Busiest hour",peak===null?"—":pad(peak)+":00–"+pad((peak+1)%24)+":00"]].map(function(k){return '<div class="kpi">'+k[0]+'<b>'+k[1]+'</b></div>'}).join("");
  /* sales by hour */
  var lo=Math.min.apply(null,[10].concat(hk)),hi=Math.max.apply(null,[22].concat(hk)),hmax=0,hb="";
  for(var h=lo;h<=hi;h++)hmax=Math.max(hmax,hours[h]||0);
  for(h=lo;h<=hi;h++)hb+=bar(hours[h]||0,hmax,pad(h)+":00",h===peak?"var(--pri-d)":"");
  $("anHours").innerHTML=hb;
  /* payments, types */
  $("anPay").innerHTML=donut(["Cash","Card","Online"].map(function(k){return {n:PL(k),v:bd[k],c:PCOL[k]}}),money(all));
  $("anType").innerHTML=donut(Object.keys(types).map(function(k){return {n:k,v:types[k],c:TCOL[k]||"#b5527a"}}),n+(n===1?" order":" orders"));
  /* categories, top items */
  $("anCat").innerHTML=hbars(Object.keys(cats).map(function(k){return {n:k,v:cats[k],t:money(cats[k])}}).sort(function(a,b){return b.v-a.v}));
  $("anTop").innerHTML=hbars(Object.keys(prod).map(function(k){return {n:k,v:prod[k].q,t:prod[k].q+" sold"}}).sort(function(a,b){return b.v-a.v}).slice(0,5));
  /* daily history (closed days + today) */
  var days=db.days.slice(-13).map(function(x){return {l:x.d.slice(8)+"/"+x.d.slice(5,7),v:x.s}});
  if(n)days.push({l:"Today",v:all});
  var dmax=Math.max.apply(null,days.map(function(x){return x.v}).concat([0]));
  $("anDays").innerHTML=days.length?days.map(function(x){return bar(x.v,dmax,x.l,x.l==="Today"?"var(--pri-d)":"")}).join(""):'<div class="none" style="width:100%">Daily history appears after you close your first day.</div>';
}
