/* Impasto POS — Table selection */
function busyTables(){
  var m={};Object.keys(db.held).forEach(function(k){m[k]=1});Object.keys(db.occ).forEach(function(k){m[k]=1});
  if(curTable&&Object.keys(cart).length)m[curTable]=1;
  return Object.keys(m).length;
}
function syncType(){
  var dine=type==="Dine-in";
  $("ref").hidden=dine;$("tblBtn").hidden=!dine;
  $("tblBtn").textContent=curTable?"Table "+curTable:"Select table";
  $("tblBtn").classList.toggle("on",!!curTable);
}
function heldInfo(h){var n=0,t=0;Object.keys(h.cart).forEach(function(k){var l=h.cart[k],m=MENU[l.id];if(m){n+=l.qty;t+=unitPrice(m,l.size,l.ex)*l.qty}});return {n:n,t:t}}
function renderTables(){
  var h="",ordering=Object.keys(cart).length>0;
  for(var n=1;n<=CONFIG.tables;n++){
    var o=db.held[n],p=db.occ[n],sel=String(curTable)===String(n),cur=sel&&ordering,i=o?heldInfo(o):null,txt,busy=true;
    if(o)txt=i.n+(i.n===1?' item · ':' items · ')+money(i.t);
    else if(cur)txt='Ordering…';
    else if(p)txt='Occupied · '+money(p.s);
    else{txt='Free';busy=false}
    h+='<button class="tbl '+(busy?'busy':'free')+(sel?' sel':'')+'" data-n="'+n+'"><b>'+n+'</b><span>'+txt+'</span>'+(p&&!o&&!cur?'<em class="tfree" data-free="'+n+'">Free table</em>':'')+'</button>';
  }
  $("tblGrid").innerHTML=h;
}
function openTables(){renderTables();$("tblDlg").showModal()}
function setTable(n){
  if(curTable&&String(curTable)!==String(n)&&db.held[curTable]&&Object.keys(cart).length){delete db.held[curTable];save();updateKpis()}
  curTable=n;syncType();renderCart();
}
function loadHeld(n){
  var h=db.held[n];if(!h)return;cart={};
  Object.keys(h.cart).forEach(function(k){var l=h.cart[k];if(MENU[l.id])cart[k]={id:l.id,size:l.size,ex:(l.ex||[]).slice(),qty:l.qty}});
  $("disc").value=h.disc||0;curTable=n;curCust=h.cust||0;syncType();syncCust();renderCart();
}
$("tblBtn").onclick=openTables;
$("tblClose").onclick=function(){$("tblDlg").close()};
$("tblGrid").onclick=function(e){
  var fr=e.target.closest("[data-free]");
  if(fr){var fn=fr.dataset.free;$("tblDlg").close();
    ask("Free Table "+fn+"?","The table will be marked as available again.","Free table",function(){delete db.occ[fn];logAct("free","Freed Table "+fn);save();updateKpis();renderCart();openTables()});return}
  var b=e.target.closest("[data-n]");if(!b)return;var n=+b.dataset.n,h=db.held[n];
  $("tblDlg").close();
  if(String(curTable)===String(n))return;
  if(h){
    if(Object.keys(cart).length)ask("Load Table "+n+"?","Table "+n+" has an open order. The current order will be replaced by it.","Load order",function(){loadHeld(n)});
    else loadHeld(n);
  }else setTable(n);
};
