/* Impasto POS — Customer account */
function custById(id){for(var i=0;i<db.cust.length;i++)if(db.cust[i].id===id)return db.cust[i];return null}
function nextCustId(){var m=0;db.cust.forEach(function(c){if(c.id>m)m=c.id});return m+1}
function syncCust(){var c=custById(curCust);$("custBtn").textContent=c?"Customer: "+c.name:"Add customer";$("custBtn").classList.toggle("on",!!c)}
function renderCuList(){
  var q=$("cuSearch").value.trim().toLowerCase();
  var list=db.cust.filter(function(c){return (c.name+" "+(c.phone||"")).toLowerCase().indexOf(q)>-1}).slice(0,40);
  $("cuList").innerHTML=list.length?list.map(function(c){var st=custStats(c);
    return '<button type="button" class="cuitem'+(c.id===curCust?' on':'')+'" data-id="'+c.id+'"><b>'+esc(c.name)+'</b><span>'+esc(c.phone||"No phone")+'</span><em>'+st.n+(st.n===1?' order · ':' orders · ')+money(st.t)+'</em></button>'}).join("")
    :'<div class="none">'+(db.cust.length?"No customers match your search.":"No customers yet. Add the first one below.")+'</div>';
}
function selectCust(c){
  curCust=c.id;syncCust();
  if(type==="Delivery"&&!$("ref").value.trim())$("ref").value=[c.phone,c.notes].filter(Boolean).join(" · ");
}
$("custBtn").onclick=function(){$("cuSearch").value="";renderCuList();$("cuDlg").showModal()};
$("cuSearch").oninput=renderCuList;
$("cuList").onclick=function(e){var b=e.target.closest("[data-id]");if(!b)return;var c=custById(+b.dataset.id);if(c){selectCust(c);$("cuDlg").close()}};
$("cuAdd").onclick=function(){var n=$("cuName").value.trim();if(!n)return toast("Enter the customer name.");
  var c={id:nextCustId(),name:n,phone:$("cuPhone").value.trim(),notes:"",n:0,s:0};db.cust.push(c);save();
  $("cuName").value="";$("cuPhone").value="";selectCust(c);$("cuDlg").close();toast(n+" added and selected")};
$("cuNone").onclick=function(){curCust=0;syncCust();$("cuDlg").close()};
$("cuClose").onclick=function(){$("cuDlg").close()};
var acIdx=-1;
function openAccount(i){
  var c=db.cust[i];if(!c)return;acIdx=i;
  $("acAv").textContent=c.name.charAt(0).toUpperCase();$("acName").textContent=c.name;$("acSub").textContent=c.phone||"No phone";
  var n=c.n||0,t=c.s||0;
  $("acKpis").innerHTML=[["Orders",n],["Total spent",money(t)],["Average order",money(n?t/n:0)],["Last visit",c.last?new Date(c.last).toLocaleDateString([],{day:"numeric",month:"short"}):"—"]].map(function(k){return '<div class="kpi">'+k[0]+'<b>'+k[1]+'</b></div>'}).join("");
  $("acEName").value=c.name;$("acEPhone").value=c.phone||"";$("acENotes").value=c.notes||"";
  $("acHist").innerHTML=(c.hist&&c.hist.length)?c.hist.map(function(h){var d=new Date(h.ts);
    return '<div class="achrow"><div><b>'+d.toLocaleDateString([],{day:"numeric",month:"short"})+' · '+d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+'</b><small>'+esc(h.type)+' · '+esc(h.items)+'</small></div><b>'+money(h.total)+'</b></div>'}).join("")
    :'<div class="none">No orders yet. Select this customer on a new order to build their history.</div>';
  $("acDlg").showModal();
}
$("acClose").onclick=function(){$("acDlg").close()};
$("acSave").onclick=function(){var c=db.cust[acIdx];if(!c)return;var n=$("acEName").value.trim();if(!n)return toast("The name can't be empty.");
  c.name=n;c.phone=$("acEPhone").value.trim();c.notes=$("acENotes").value.trim();save();$("acDlg").close();renderCustomers();syncCust();toast("Account updated")};
