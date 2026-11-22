/* Impasto POS — Navigation */
var VIEWS=["pos","orders","delivery","analytics","reports","staff","manage","settings"];
var navTok=0;
function showView(v){
  VIEWS.forEach(function(x){var el=$("v-"+x);el.classList.remove("leave");el.hidden=x!==v});
  if(v==="orders")renderOrders();if(v==="delivery")renderDelivery();if(v==="staff")renderStaff();if(v==="manage")renderMgr();if(v==="analytics")renderAnalytics();if(v==="reports")renderReports();if(v==="settings")renderSettings();
}
function go(v){
  if(VIEWS.indexOf(v)<0)return;
  document.querySelectorAll(".nav button,.newbtn").forEach(function(b){b.classList.toggle("on",b.dataset.v===v)});
  var cur=VIEWS.filter(function(x){return !$("v-"+x).hidden})[0],tok=++navTok;
  if(cur&&cur!==v){
    var el=$("v-"+cur);el.classList.add("leave");
    setTimeout(function(){if(tok===navTok)showView(v);else el.classList.remove("leave")},130);
  }else showView(v);
}
/* only the sidebar buttons navigate, and only to a page that exists */
document.addEventListener("click",function(e){var b=e.target.closest(".nav [data-v],.newbtn[data-v]");if(!b||VIEWS.indexOf(b.dataset.v)<0)return;if(b.dataset.open)mgTab=b.dataset.open;if(b.dataset.v==="staff")stName=CONFIG.cashier;go(b.dataset.v)});
$("sbToggle").onclick=function(){$("side").classList.toggle("mini")};
if(innerWidth<900)$("side").classList.add("mini");
