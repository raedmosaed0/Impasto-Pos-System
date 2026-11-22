/* Impasto POS — Manage hub (inventory, customers, payments, invoice) */
var mgTab="menu", MG=["menu","inventory","customers","payments","invoice"];
function renderMgr(){
  MG.forEach(function(t){$("mg-"+t).hidden=t!==mgTab});
  [].forEach.call($("mgTabs").children,function(b){b.classList.toggle("on",b.dataset.tab===mgTab)});
  ({menu:renderMenuAdmin,inventory:renderInventory,customers:renderCustomers,payments:renderPayments,invoice:renderInvoice})[mgTab]();
}
$("mgTabs").onclick=function(e){var b=e.target.closest("[data-tab]");if(!b)return;mgTab=b.dataset.tab;renderMgr()};
function emptyRow(n,t){return '<tr><td colspan="'+n+'" style="text-align:center;padding:24px;opacity:.7">'+t+'</td></tr>'}
function delBtn(i){return '<button class="btn" style="padding:4px 12px" data-del="'+i+'">Delete</button>'}

/* Inventory */
function renderInventory(){
  var low=0,out=0;db.inv.forEach(function(x){if(x.qty<=0)out++;else if(x.qty<=x.low)low++});
  $("invKpis").innerHTML='<div class="kpi">Items<b>'+db.inv.length+'</b></div><div class="kpi">Low stock<b>'+low+'</b></div><div class="kpi">Out of stock<b>'+out+'</b></div>';
  $("invBody").innerHTML=db.inv.length?db.inv.map(function(x,i){
    var st=x.qty<=0?"out":x.qty<=x.low?"low":"ok",lb={ok:"In stock",low:"Low",out:"Out"}[st];
    return '<tr><td>'+esc(x.name)+'</td><td>'+esc(x.unit||"")+'</td><td class="r"><input type="number" min="0" step="any" value="'+x.qty+'" data-i="'+i+'" data-f="qty" aria-label="Quantity of '+esc(x.name)+'"></td><td class="r"><input type="number" min="0" step="any" value="'+x.low+'" data-i="'+i+'" data-f="low" aria-label="Alert level of '+esc(x.name)+'"></td><td><span class="stt '+st+'">'+lb+'</span></td><td>'+delBtn(i)+'</td></tr>'}).join("")
    :emptyRow(6,"No stock items yet. Add your first ingredient above.");
}
$("invBody").onchange=function(e){var t=e.target,x=db.inv[+t.dataset.i];if(!x||!t.dataset.f)return;x[t.dataset.f]=Math.max(0,parseFloat(t.value)||0);save();renderInventory()};
$("invBody").onclick=function(e){var b=e.target.closest("[data-del]");if(!b)return;var i=+b.dataset.del,x=db.inv[i];
  ask("Delete stock item?",x.name+" will be removed from the inventory.","Delete",function(){db.inv.splice(i,1);save();renderInventory()},true)};
$("iAdd").onclick=function(){var n=$("iName").value.trim();if(!n)return toast("Enter an item name.");
  db.inv.push({name:n,unit:$("iUnit").value.trim(),qty:Math.max(0,parseFloat($("iQty").value)||0),low:Math.max(0,parseFloat($("iLow").value)||0)});
  save();["iName","iUnit","iQty","iLow"].forEach(function(id){$(id).value=""});renderInventory();toast(n+" added to inventory")};

/* Customers */
function digits(v){return String(v||"").replace(/\D/g,"")}
function custStats(c){return {n:c.n||0,t:c.s||0}}
function renderCustomers(){
  var q=$("cSearch").value.trim().toLowerCase();
  var list=db.cust.map(function(c,i){return {c:c,i:i}}).filter(function(x){return (x.c.name+" "+(x.c.phone||"")).toLowerCase().indexOf(q)>-1});
  $("custBody").innerHTML=list.length?list.map(function(x){var c=x.c,st=custStats(c);
    return '<tr><td><button class="lnk" data-acc="'+x.i+'">'+esc(c.name)+'</button></td><td>'+esc(c.phone||"—")+'</td><td>'+esc(c.notes||"")+'</td><td class="r">'+st.n+'</td><td class="r">'+money(st.t)+'</td><td>'+delBtn(x.i)+'</td></tr>'}).join("")
    :emptyRow(6,db.cust.length?"No customers match your search.":"No customers yet. Add one above.");
}
$("cSearch").oninput=renderCustomers;
$("cAdd").onclick=function(){var n=$("cName").value.trim();if(!n)return toast("Enter the customer name.");
  db.cust.push({id:nextCustId(),name:n,phone:$("cPhone").value.trim(),notes:$("cNotes").value.trim(),n:0,s:0});save();
  ["cName","cPhone","cNotes"].forEach(function(id){$(id).value=""});renderCustomers();toast(n+" added")};
$("custBody").onclick=function(e){var ac=e.target.closest("[data-acc]");if(ac){openAccount(+ac.dataset.acc);return}var b=e.target.closest("[data-del]");if(!b)return;var i=+b.dataset.del,c=db.cust[i];
  ask("Delete customer?",c.name+" will be removed from your customers.","Delete",function(){db.cust.splice(i,1);save();renderCustomers()},true)};

/* Payments */
function renderPayments(){
  var bd={Cash:0,Card:0,Online:0},splits=0;
  db.orders.forEach(function(o){var b=breakdown(o);bd.Cash+=b.Cash;bd.Card+=b.Card;bd.Online+=b.Online;if(o.method==="Split")splits++});
  $("payKpis").innerHTML='<div class="kpi">Cash<b>'+money(bd.Cash)+'</b></div><div class="kpi">Visa<b>'+money(bd.Card)+'</b></div><div class="kpi">Transfer<b>'+money(bd.Online)+'</b></div><div class="kpi">Split orders<b>'+splits+'</b></div>';
  var rows="";
  db.orders.slice().reverse().forEach(function(o){
    var ps=o.pays||[{m:o.method,a:o.total}],t=new Date(o.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    ps.forEach(function(p){rows+='<tr><td>#'+o.no+'</td><td>'+t+'</td><td>'+esc(PL(p.m))+'</td><td class="r">'+money(p.a)+'</td><td>'+(p.m==="Cash"&&o.change>0.004?"Change "+money(o.change):"")+'</td></tr>'});
  });
  $("payBody").innerHTML=rows||emptyRow(5,"No payments yet today.");
}

/* Reports */
function renderReports(){
  var all=0,disc=0,svc=0,tax=0,types={"Dine-in":[0,0],"Takeaway":[0,0],"Delivery":[0,0]},items={};
  db.orders.forEach(function(o){
    all+=o.total;disc+=o.disc||0;svc+=o.svc||0;tax+=o.tax||0;
    var t=types[o.type]||(types[o.type]=[0,0]);t[0]++;t[1]+=o.total;
    o.items.forEach(function(i){var it=items[i.name]||(items[i.name]={q:0,r:0});it.q+=i.qty;it.r+=i.price*i.qty});
  });
  var n=db.orders.length;
  $("rpKpis").innerHTML=[["Total sales",money(all)],["Orders",n],["Average order",money(n?all/n:0)],["Discounts given",money(disc)],["Service charge",money(svc)],[CONFIG.taxLabel+" collected",money(tax)]].map(function(k){return '<div class="kpi">'+k[0]+'<b>'+k[1]+'</b></div>'}).join("");
  $("rpType").innerHTML=Object.keys(types).map(function(k){return '<tr><td>'+esc(k)+'</td><td class="r">'+types[k][0]+'</td><td class="r">'+money(types[k][1])+'</td></tr>'}).join("");
  var top=Object.keys(items).map(function(k){return {n:k,q:items[k].q,r:items[k].r}}).sort(function(a,b){return b.q-a.q}).slice(0,10);
  $("rpItems").innerHTML=top.length?top.map(function(x){return '<tr><td>'+esc(x.n)+'</td><td class="r">'+x.q+'</td><td class="r">'+money(x.r)+'</td></tr>'}).join(""):emptyRow(3,"No sales yet today.");
}
