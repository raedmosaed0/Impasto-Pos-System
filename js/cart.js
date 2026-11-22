/* Impasto POS — Cart */
function lineOpts(l){return [l.size].concat(l.ex).filter(Boolean).join(" · ")}
function compute(){
  var sub=0;Object.keys(cart).forEach(function(k){var l=cart[k];sub+=unitPrice(MENU[l.id],l.size,l.ex)*l.qty});
  var d=Math.min(100,Math.max(0,parseFloat($("disc").value)||0));
  var disc=sub*d/100, base=sub-disc;
  var svc=type==="Dine-in"?base*CONFIG.serviceRate:0;
  var tax=(base+svc)*CONFIG.taxRate;
  calc={sub:sub,pct:d,disc:disc,svc:svc,tax:tax,total:base+svc+tax};
}
function renderCart(){
  var ids=Object.keys(cart);
  $("lines").innerHTML=ids.length?ids.map(function(k){var l=cart[k],m=MENU[l.id],q=l.qty,o=lineOpts(l),f=flash.id===k;
    return '<div class="line'+(f&&flash.k==="new"?' new':'')+(IDS[m.id]?'':' nt')+'" style="--c:'+CATS[m.cat]+'">'+(IDS[m.id]?'<div class="th">'+pic(m,160)+'</div>':'')+'<span class="n">'+esc(m.name)+(o?'<small>'+esc(o)+'</small>':'')+'</span><span class="p">'+money(unitPrice(m,l.size,l.ex)*q)+'</span>'+
    '<div class="qty"><button data-a="dec" data-id="'+esc(k)+'" aria-label="Remove one">−</button><span class="'+(f&&flash.k==="bump"?'bump':'')+'">'+q+'</span><button data-a="inc" data-id="'+esc(k)+'" aria-label="Add one">+</button></div>'+
    '<button class="rm" data-a="rm" data-id="'+esc(k)+'">Remove</button></div>'}).join("")
    :'<div class="tk-empty">The order is empty.<br>Tap a menu item to add it.</div>';
  compute();
  $("discAmt").hidden=!calc.disc;$("sDisc").textContent="−"+money(calc.disc);
  [].forEach.call($("discQ").children,function(b){b.classList.toggle("on",+b.dataset.d===calc.pct)});
  $("sSub").textContent=money(calc.sub);
  $("lblSvc").textContent="Service ("+Math.round(CONFIG.serviceRate*100)+"%)";
  $("sSvc").textContent=type==="Dine-in"?money(calc.svc):"—";
  $("lblTax").textContent=CONFIG.taxLabel+" ("+Math.round(CONFIG.taxRate*100)+"%)";
  $("sTax").textContent=money(calc.tax);
  $("sTot").textContent=money(calc.total);
  $("bPay").disabled=!ids.length;$("tbTbl").textContent=busyTables()+" / "+CONFIG.tables;
  var tt=document.querySelector(".sums .tot");tt.classList.remove("bump");if(flash.id!=null){void tt.offsetWidth;tt.classList.add("bump")}
  flash={};
  $("bPay").textContent=ids.length?"Charge "+money(calc.total):"Charge";
}
$("lines").onclick=function(e){var b=e.target.closest("[data-a]");if(!b)return;var id=b.dataset.id,a=b.dataset.a;
  if(!cart[id]||closing)return;
  var row=b.closest(".line");if(row&&row.classList.contains("out"))return;
  var gone=a==="rm"||(a==="dec"&&cart[id].qty<=1);
  if(gone&&row){row.classList.add("out");setTimeout(function(){delete cart[id];renderCart()},260);return}
  if(a==="inc"){cart[id].qty++;flash={id:id,k:"bump"}} else if(a==="dec"){cart[id].qty--} else delete cart[id];renderCart()};
var closing=false;
/* slide every line out, then run cb */
function animateOut(cb){
  var rows=document.querySelectorAll("#lines .line");
  if(!rows.length){cb();return}
  [].forEach.call(rows,function(r,i){r.style.animationDelay=(i*45)+"ms";r.classList.add("out")});
  setTimeout(cb,260+(rows.length-1)*45);
}
$("disc").oninput=renderCart;
$("discQ").onclick=function(e){var b=e.target.closest("[data-d]");if(!b)return;$("disc").value=(+$("disc").value===+b.dataset.d)?0:b.dataset.d;renderCart()};
$("types").onclick=function(e){var b=e.target.closest("button");if(!b)return;type=b.dataset.t;
  [].forEach.call($("types").children,function(x){x.classList.toggle("on",x===b)});
  $("ref").placeholder=type==="Dine-in"?"Table number":type==="Delivery"?"Customer phone / address":"Customer name";syncType();renderCart()};
function clearOrder(){cart={};curTable="";curCust=0;$("disc").value=0;$("ref").value="";syncType();syncCust();renderCart()}
