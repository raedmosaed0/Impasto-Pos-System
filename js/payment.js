/* Impasto POS — Payment */
function PL(m){return m==="Card"?"Visa":m==="Online"?"Transfer":m}
var PAYM=["Cash","Card","Online"], sp=[];
function r2(n){return Math.round(n*100)/100}
function paidSum(list){var s=0;list.forEach(function(p){s+=p.a||0});return r2(s)}
function openPay(){
  if(closing)return;
  if(type==="Dine-in"&&!curTable){toast("Choose a table first");openTables();return}
  compute();total=r2(calc.total);method="Cash";
  $("payTot").textContent=money(total);
  [].forEach.call($("methods").children,function(x){x.classList.toggle("on",x.dataset.m==="Cash")});
  var t=Math.ceil(total),q=[total,t,t+5,Math.ceil(t/10)*10+10,Math.ceil(t/50)*50+50];
  var seen={};$("quick").innerHTML=q.filter(function(v){if(seen[v])return false;seen[v]=1;return true}).map(function(v){
    return '<button class="btn" data-amt="'+v+'">'+money(v)+'</button>'}).join("");
  $("tender").value=total;
  sp=[{m:"Cash",a:0},{m:"Card",a:0}];
  showMode();$("payDlg").showModal();$("tender").select();
}
function showMode(){
  $("cashBox").hidden=method!=="Cash";
  $("splitBox").hidden=method!=="Split";
  var n=$("payNote");n.hidden=!(method==="Card"||method==="Online");
  n.textContent=method==="Card"?"Charge the full amount of "+money(total)+" on the Visa terminal.":"Confirm that the money transfer of "+money(total)+" was received.";
  if(method==="Split")renderSplit();else refreshPay();
}
function refreshPay(){
  var ok=true;
  if(method==="Cash"){
    var t=parseFloat($("tender").value)||0,c=r2(t-total);
    $("chg").className="change "+(c<0?"bad":"good");
    $("chgL").textContent=c<0?"Short by":"Change due";$("chgV").textContent=money(Math.abs(c));
    ok=c>=-0.005;
  }else if(method==="Split"){
    var paid=paidSum(sp),rem=r2(total-paid),cash=0,cls,L,V;
    sp.forEach(function(p){if(p.m==="Cash")cash+=p.a||0});
    var change=r2(paid-total);
    if(rem>0.005){cls="bad";L="Remaining";V=money(rem)}
    else if(change>cash+0.005){cls="bad";L="Visa / Transfer exceeds total by";V=money(change-cash)}
    else{cls="good";L=change>0.005?"Change due":"Fully paid";V=money(Math.max(0,change))}
    $("spChg").className="change "+cls;$("spL").textContent=L;$("spV").textContent=V;
    ok=rem<=0.005&&change<=cash+0.005;
  }
  $("payOk").disabled=!ok;
}
function renderSplit(){
  $("splitRows").innerHTML=sp.map(function(p,i){
    return '<div class="sprow"><select data-i="'+i+'" data-f="m" aria-label="Payment method">'+PAYM.map(function(m){return '<option value="'+m+'"'+(m===p.m?' selected':'')+'>'+PL(m)+'</option>'}).join("")+'</select>'+
    '<input type="number" min="0" step="0.01" value="'+(p.a||"")+'" placeholder="0.00" data-i="'+i+'" data-f="a" aria-label="Amount">'+
    '<button type="button" class="btn" data-rest="'+i+'">Rest</button>'+
    (sp.length>1?'<button type="button" class="icon-btn" data-rm="'+i+'" aria-label="Remove payment">'+ic("close")+'</button>':'<span></span>')+'</div>'}).join("");
  [].forEach.call($("splitRows").querySelectorAll("select"),enhance);
  $("splitAdd").hidden=sp.length>=4;
  refreshPay();
}
$("splitRows").oninput=function(e){var t=e.target;if(t.dataset.f!=="a")return;sp[+t.dataset.i].a=Math.max(0,parseFloat(t.value)||0);refreshPay()};
$("splitRows").onchange=function(e){var t=e.target;if(t.dataset.f!=="m")return;sp[+t.dataset.i].m=t.value;renderSplit()};
$("splitRows").onclick=function(e){var b=e.target.closest("button");if(!b)return;
  if(b.dataset.rest!==undefined){var i=+b.dataset.rest,others=0;sp.forEach(function(p,k){if(k!==i)others+=p.a||0});sp[i].a=Math.max(0,r2(total-others));renderSplit()}
  else if(b.dataset.rm!==undefined){sp.splice(+b.dataset.rm,1);renderSplit()}};
$("splitAdd").onclick=function(){if(sp.length<4){sp.push({m:"Card",a:0});renderSplit()}};
$("bPay").onclick=openPay;
$("tender").oninput=refreshPay;
$("quick").onclick=function(e){var b=e.target.closest("[data-amt]");if(!b)return;$("tender").value=b.dataset.amt;refreshPay()};
$("methods").onclick=function(e){var b=e.target.closest("button");if(!b)return;method=b.dataset.m;
  [].forEach.call($("methods").children,function(x){x.classList.toggle("on",x===b)});
  showMode();if(method==="Cash")$("tender").select()};
$("payCancel").onclick=function(){$("payDlg").close()};
$("payOk").onclick=function(){
  var items=Object.keys(cart).map(function(k){var l=cart[k],m=MENU[l.id];return {name:m.name,opts:lineOpts(l),price:unitPrice(m,l.size,l.ex),qty:l.qty}});
  var pays,tender;
  if(method==="Cash"){tender=parseFloat($("tender").value);if(!(tender>=0))tender=total;pays=[{m:"Cash",a:tender}]}
  else if(method==="Split"){pays=sp.filter(function(p){return p.a>0}).map(function(p){return {m:p.m,a:p.a}});if(!pays.length)pays=[{m:"Cash",a:total}];tender=paidSum(pays)}
  else{pays=[{m:method,a:total}];tender=total}
  var o={no:db.next++,ts:Date.now(),type:type,ref:type==="Dine-in"?"Table "+curTable:$("ref").value.trim(),table:type==="Dine-in"?curTable:"",method:method,pays:pays,items:items,
    sub:calc.sub,pct:calc.pct,disc:calc.disc,svc:calc.svc,tax:calc.tax,total:total,tender:tender,change:r2(Math.max(0,tender-total)),status:type==="Delivery"?"New":"Done",cashier:CONFIG.cashier};
  if(type==="Dine-in"&&curTable){delete db.held[curTable];var oc=db.occ[curTable]||(db.occ[curTable]={ts:Date.now(),n:0,s:0});oc.n++;oc.s=r2(oc.s+total)}
  var cu=custById(curCust);
  if(cu){o.cust=cu.id;o.custName=cu.name;cu.n=(cu.n||0)+1;cu.s=r2((cu.s||0)+total);cu.last=o.ts;
    (cu.hist=cu.hist||[]).unshift({no:o.no,ts:o.ts,type:o.type,total:total,items:items.map(function(i){return i.qty+"× "+i.name}).join(", ")});
    if(cu.hist.length>30)cu.hist.length=30}
  var cs=db.cs[CONFIG.cashier]||(db.cs[CONFIG.cashier]={n:0,s:0,last:0});cs.n++;cs.s=r2(cs.s+total);cs.last=o.ts;
  logAct("order","Order #"+o.no+" · "+o.type+(o.ref?" · "+o.ref:""),total);
  db.orders.push(o);save();$("payDlg").close();
  if($("prn").checked)printReceipt(o);
  closing=true;updateKpis();animateOut(function(){clearOrder();closing=false;updateKpis()});
  toast("Order #"+o.no+" completed"+(o.change>0?" · change "+money(o.change):""));
};
