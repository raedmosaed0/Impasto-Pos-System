/* Impasto POS — Catalog and size/add-ons dialog */
/* staggered fade-in of a list's children when the user switches between lists */
function swap(el){
  [].forEach.call(el.children,function(c,i){c.style.setProperty("--i",Math.min(i,14))});
  el.classList.remove("swap");void el.offsetWidth;el.classList.add("swap");
  clearTimeout(el._sw);el._sw=setTimeout(function(){el.classList.remove("swap")},900);
}
function renderCats(){
  $("cats").innerHTML=["All"].concat(Object.keys(CATS)).map(function(c){
    return '<button class="cat'+(c===cat?' on':'')+'" data-c="'+c+'">'+c+'</button>'}).join("");
}
function renderGrid(){
  var q=$("q").value.trim().toLowerCase();
  var list=MENU.filter(function(m){return (cat==="All"||m.cat===cat)&&m.name.toLowerCase().indexOf(q)>-1});
  $("grid").innerHTML=list.length?list.map(function(m){
    var price=sizesOf(m).length>1?"From "+money(lowPrice(m)):money(m.price);
    return '<button class="tile'+(m.off?' off':'')+'"'+(m.off?' disabled':'')+' style="--c:'+CATS[m.cat]+'" data-id="'+m.id+'"><i class="st '+(m.off?'no':'ok')+'">'+(m.off?'Out of Stock':'Available')+'</i>'+(IDS[m.id]?'<div class="iw">'+pic(m,600)+'</div>':'')+'<div class="tb"><b>'+esc(m.name)+'</b><span>'+price+'</span></div></button>'}).join("")
    :'<div class="empty">No items match “'+esc(q)+'”. Try another name or category.</div>';
}
$("cats").onclick=function(e){var b=e.target.closest(".cat");if(!b)return;cat=b.dataset.c;renderCats();renderGrid();swap($("grid"))};
$("q").oninput=renderGrid;
$("grid").onclick=function(e){var b=e.target.closest(".tile");if(!b)return;var m=MENU[b.dataset.id];if(m&&!m.off)openOpt(m)};


var opt=null;
function openOpt(m){opt={m:m,size:defSize(m),ex:[],qty:1};renderOpt();$("optDlg").showModal()}
function renderOpt(){
  var m=opt.m,S=sizesOf(m),E=extrasOf(m);
  $("opHead").innerHTML=IDS[m.id]?'<img alt="" src="'+photo(m.id,800)+'">':'<div class="ph">'+(EMO[m.cat]||ic("menu"))+'</div>';
  $("opName").textContent=m.name;$("opSub").textContent=m.cat;
  $("opSizeBox").hidden=!S.length;
  $("opSizes").innerHTML=S.map(function(z){return '<button type="button" class="sz'+(opt.size===z[0]?' on':'')+'" data-s="'+esc(z[0])+'"><b>'+esc(z[0])+'</b><span>'+money(Math.max(0,m.price+z[1]))+'</span></button>'}).join("");
  $("opSizes").style.gridTemplateColumns="repeat("+Math.max(1,S.length)+",1fr)";
  $("opExBox").hidden=!E.length;
  $("opExtras").innerHTML=E.map(function(x){return '<button type="button" class="ex'+(opt.ex.indexOf(x[0])>-1?' on':'')+'" data-x="'+esc(x[0])+'"><i class="ck"></i><b>'+esc(x[0])+'</b><span>'+(x[1]?'+'+money(x[1]):'Free')+'</span></button>'}).join("");
  $("opQty").textContent=opt.qty;
  $("opAdd").textContent="Add to order · "+money(unitPrice(m,opt.size,opt.ex)*opt.qty);
}
$("opSizes").onclick=function(e){var b=e.target.closest("[data-s]");if(!b)return;opt.size=b.dataset.s;renderOpt()};
$("opExtras").onclick=function(e){var b=e.target.closest("[data-x]");if(!b)return;var n=b.dataset.x,i=opt.ex.indexOf(n);if(i>-1)opt.ex.splice(i,1);else opt.ex.push(n);renderOpt()};
$("opMinus").onclick=function(){opt.qty=Math.max(1,opt.qty-1);renderOpt()};
$("opPlus").onclick=function(){opt.qty=Math.min(99,opt.qty+1);renderOpt()};
$("opCancel").onclick=function(){$("optDlg").close()};
$("opAdd").onclick=function(){
  var ex=opt.ex.slice().sort(),key=opt.m.id+"|"+opt.size+"|"+ex.join(",");
  flash={id:key,k:cart[key]?"bump":"new"};
  if(cart[key])cart[key].qty+=opt.qty;else cart[key]={id:opt.m.id,size:opt.size,ex:ex,qty:opt.qty};
  $("optDlg").close();renderCart();
};
