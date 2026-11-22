/* Impasto POS — Orders and reports */
function breakdown(o){
  var b={Cash:0,Card:0,Online:0};
  if(!o.pays){b[o.method]=o.total;return b}
  o.pays.forEach(function(p){b[p.m]=(b[p.m]||0)+p.a});
  b.Cash=Math.max(0,r2(b.Cash-(o.change||0)));
  return b;
}
function payLabel(o){
  if(o.method!=="Split"||!o.pays)return PL(o.method);
  var u=[];o.pays.forEach(function(p){if(u.indexOf(PL(p.m))<0)u.push(PL(p.m))});
  return "Split · "+u.join(" + ");
}
function updateKpis(){
  var s=0,act=0;db.orders.forEach(function(o){s+=o.total;if(o.type==="Delivery"&&o.status!=="Delivered")act++});
  $("kSales").textContent=money(s);$("bdgOrders").textContent=db.orders.length||"";$("bdgDel").textContent=act||"";
  $("tbOrders").textContent=db.orders.length;$("tbSales").textContent=money(s);
  $("tbDel").textContent=act;$("tbTbl").textContent=busyTables()+" / "+CONFIG.tables;
  var n=CONFIG.cashier;$("meName").textContent=n;$("av").innerHTML=avHTML(n);$("meSub").textContent="Shift since "+fmtWhen(db.shift.ts);
}
var oType="All";
function syncOTypes(){[].forEach.call($("oTypes").children,function(x){x.classList.toggle("on",x.dataset.t===oType)})}
function invHTML(o){
  var d=new Date(o.ts),pays=o.pays||[{m:o.method,a:o.tender}],meta=[["Type",o.type]];
  if(o.type==="Dine-in")meta.push(["Table",o.table||"—"]);
  else if(o.ref)meta.push([o.type==="Delivery"?"Deliver to":"Name",o.ref]);
  meta.push(["Cashier",o.cashier||"—"]);
  if(o.custName)meta.push(["Customer",o.custName]);
  if(o.type==="Delivery")meta.push(["Status",o.status||"New"]);
  var h='<article class="inv"><header class="inv-h"><div><div class="inv-brand">'+esc(CONFIG.name)+'</div><div class="inv-lbl">Invoice</div></div><div class="inv-no">#'+o.no+'</div></header><div class="inv-b">'+
    '<div class="inv-date"><span>'+d.toLocaleDateString([],{day:"numeric",month:"short",year:"numeric"})+' · '+d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+'</span><span class="inv-paid">PAID</span></div>'+
    '<dl class="inv-meta">'+meta.map(function(m){return '<div><dt>'+m[0]+'</dt><dd>'+esc(m[1])+'</dd></div>'}).join("")+'</dl><div class="inv-div"></div>'+
    o.items.map(function(i){return '<div class="inv-it"><span class="q">'+i.qty+'×</span><span>'+esc(i.name)+(i.opts?'<small>'+esc(i.opts)+'</small>':'')+'</span><span>'+money(i.price*i.qty)+'</span></div>'}).join("")+
    '<div class="inv-div"></div><div class="inv-sum"><div><span>Subtotal</span><span>'+money(o.sub)+'</span></div>'+
    (o.disc?'<div class="dc"><span>Discount ('+o.pct+'%)</span><span>−'+money(o.disc)+'</span></div>':'')+
    (o.svc?'<div><span>Service</span><span>'+money(o.svc)+'</span></div>':'')+
    '<div><span>'+esc(CONFIG.taxLabel)+'</span><span>'+money(o.tax)+'</span></div></div>'+
    '<div class="inv-tot"><span>Total</span><b>'+money(o.total)+'</b></div>'+
    '<div class="inv-pay">'+pays.map(function(p){return '<span>'+esc(PL(p.m))+' <b>'+money(p.a)+'</b></span>'}).join("")+(o.change>0.004?'<span>Change <b>'+money(o.change)+'</b></span>':'')+'</div></div>'+
    '<footer class="inv-f"><div class="inv-bar"></div><small>'+esc(CONFIG.footer)+'</small><button class="btn" data-no="'+o.no+'">Print receipt</button></footer></article>';
  return h;
}
function renderOrders(){
  ddSync($("oPay"));
  var all=0,bd={Cash:0,Card:0,Online:0};
  db.orders.forEach(function(o){all+=o.total;var b=breakdown(o);bd.Cash+=b.Cash;bd.Card+=b.Card;bd.Online+=b.Online});
  var avg=db.orders.length?all/db.orders.length:0;
  $("kpis").innerHTML='<div class="kpi">Total sales<b>'+money(all)+'</b></div><div class="kpi">Orders<b>'+db.orders.length+'</b></div><div class="kpi">Average order<b>'+money(avg)+'</b></div><div class="kpi">Cash<b>'+money(bd.Cash)+'</b></div><div class="kpi">Visa<b>'+money(bd.Card)+'</b></div><div class="kpi">Transfer<b>'+money(bd.Online)+'</b></div>';
  syncOTypes();
  var q=$("oSearch").value.trim().toLowerCase(),p=$("oPay").value;
  var list=db.orders.filter(function(o){
    if(oType!=="All"&&o.type!==oType)return false;
    if(p!=="All"&&o.method!==p)return false;
    if(q){
      if(/^#\d+$/.test(q))return o.no===+q.slice(1);
      if([o.no,o.type,o.ref,o.custName,o.cashier,payLabel(o)].join(" ").toLowerCase().indexOf(q)<0)return false;
    }
    return true}).reverse();
  $("invGrid").innerHTML=list.length?list.map(invHTML).join(""):
    '<div class="none" style="grid-column:1/-1">'+(db.orders.length?"No invoices match your filters.":"No orders yet today. Completed orders appear here as invoices.")+'</div>';
}
$("oSearch").oninput=renderOrders;
$("oPay").onchange=function(){renderOrders();swap($("invGrid"))};
$("oTypes").onclick=function(e){var b=e.target.closest("[data-t]");if(!b)return;oType=b.dataset.t;renderOrders();swap($("invGrid"))};
$("invGrid").onclick=function(e){var b=e.target.closest("[data-no]");if(!b)return;
  var o=db.orders.filter(function(x){return x.no==b.dataset.no})[0];if(o)printReceipt(o)};
/* CSV cells that start with = + - @ could run as formulas in Excel; prefix them with an apostrophe */
function csvCell(c){var t=String(c);if(typeof c==="string"&&/^[=+\-@\t\r]/.test(t)&&!/^-?\d+(\.\d+)?$/.test(t))t="'"+t;return '"'+t.replace(/"/g,'""')+'"'}
$("bCsv").onclick=function(){
  var rows=[["Order","Date","Type","Ref","Customer","Cashier","Payment","Items","Subtotal","Discount","Service","Tax","Total","Cash","Visa","Transfer"]];
  db.orders.forEach(function(o){var b=breakdown(o);rows.push([o.no,new Date(o.ts).toLocaleString(),o.type,o.ref,o.custName||"",o.cashier||"",payLabel(o),
    o.items.map(function(i){return i.qty+"x "+i.name+(i.opts?" ("+i.opts+")":"")}).join("; "),o.sub.toFixed(2),o.disc.toFixed(2),o.svc.toFixed(2),o.tax.toFixed(2),o.total.toFixed(2),b.Cash.toFixed(2),b.Card.toFixed(2),b.Online.toFixed(2)])});
  var csv=rows.map(function(r){return r.map(csvCell).join(",")}).join("\n");
  var a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["﻿"+csv],{type:"text/csv"}));
  a.download="impasto-sales-"+new Date().toISOString().slice(0,10)+".csv";a.click();logAct("csv","Exported sales CSV");save();
};
$("bReset").onclick=function(){
  if(!db.orders.length)return toast("There are no orders to close.");
  ask("Close the day?","Export the CSV first — this clears all saved orders and restarts order numbers at 1.","Close the day",function(){closeDaySummary();db.orders=[];db.next=1;save();updateKpis();renderOrders();renderReports();toast("Day closed. Order numbers restart at 1.")},true);
};
