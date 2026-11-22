/* Impasto POS — Delivery board */
var STAT=["New","Preparing","On the way","Delivered"],NEXT={"New":"Start preparing","Preparing":"Send out","On the way":"Mark delivered"};
function dcard(o){
  return '<div class="dcard"><div class="dh"><b>#'+o.no+'</b><span>'+new Date(o.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+'</span></div><div class="dref">'+(esc(o.ref)||"No phone or address")+'</div><div class="dit">'+o.items.map(function(i){return i.qty+"× "+esc(i.name)+(i.opts?" ("+esc(i.opts)+")":"")}).join(", ")+'</div><div class="dh"><b>'+money(o.total)+'</b>'+(NEXT[o.status]?'<button class="btn pri" data-adv="'+o.no+'">'+NEXT[o.status]+'</button>':'')+'</div></div>';
}
function renderDelivery(){
  var d=db.orders.filter(function(o){return o.type==="Delivery"});d.forEach(function(o){o.status=o.status||"New"});
  $("board").innerHTML=STAT.map(function(s){var l=d.filter(function(o){return o.status===s});
    return '<div class="col"><h3>'+s+'<span>'+l.length+'</span></h3>'+(l.map(dcard).join("")||'<div class="none">'+(d.length?'Nothing here':'No delivery orders yet. Pick Delivery in New order and enter a phone or address.')+'</div>')+'</div>'}).join("");
}
$("board").onclick=function(e){var b=e.target.closest("[data-adv]");if(!b)return;
  var o=db.orders.filter(function(x){return x.no==b.dataset.adv})[0];
  if(o){o.status=STAT[Math.min(3,STAT.indexOf(o.status)+1)];logAct("deliv","Order #"+o.no+" · "+o.status);save();renderDelivery();updateKpis()}};
