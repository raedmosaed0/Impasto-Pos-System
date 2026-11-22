/* Impasto POS — Menu management */
function patch(m,o){if(m.custom)Object.assign(db.custom[m.id-BASE.length],o);else{db.ov[m.name]=Object.assign(db.ov[m.name]||{},o)}}
function renderMenuAdmin(){
  $("nCat").innerHTML=Object.keys(CATS).map(function(c){return '<option>'+c+'</option>'}).join("");ddSync($("nCat"));
  $("mnBody").innerHTML=MENU.map(function(m){
    return '<tr><td>'+esc(m.name)+'</td><td>'+m.cat+'</td><td class="r"><input type="number" min="0" step="0.5" value="'+m.price+'" data-id="'+m.id+'" data-f="price" aria-label="Price of '+esc(m.name)+'"></td><td class="r"><label class="sw"><input type="checkbox" data-id="'+m.id+'" data-f="on"'+(m.off?'':' checked')+' aria-label="Available"></label></td><td>'+(m.custom?'<button class="btn" style="padding:4px 12px" data-del="'+m.id+'">Delete</button>':'')+'</td></tr>'}).join("");
}
function refreshMenu(){buildMenu();renderGrid();renderCart()}
$("mnBody").onchange=function(e){var t=e.target,m=MENU[+t.dataset.id];if(!m||!t.dataset.f)return;
  if(t.dataset.f==="price")patch(m,{price:Math.max(0,parseFloat(t.value)||0)});else patch(m,{off:!t.checked});
  save();refreshMenu()};
$("mnBody").onclick=function(e){var b=e.target.closest("[data-del]");if(!b)return;var idx=+b.dataset.del-BASE.length;
  ask("Delete this item?","This item will be removed from the menu.","Delete",function(){db.custom.splice(idx,1);cart={};save();refreshMenu();renderMenuAdmin()},true)};
$("nAdd").onclick=function(){var n=$("nName").value.trim(),pr=parseFloat($("nPrice").value);
  if(!n||!(pr>=0)){return toast("Enter an item name and a price.")}
  db.custom.push({name:n,cat:$("nCat").value,price:pr,off:false});save();refreshMenu();
  $("nName").value="";$("nPrice").value="";renderMenuAdmin();toast(n+" added to the menu")};
