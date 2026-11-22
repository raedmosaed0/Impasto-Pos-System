/* Impasto POS — Settings page (currency, theme) and invoice options */
function renderSettings(){syncPrefs()}
function renderInvoice(){$("sTaxIn").value=+(CONFIG.taxRate*100).toFixed(2);$("sSvcIn").value=+(CONFIG.serviceRate*100).toFixed(2);$("sFoot").value=CONFIG.footer;$("sTbl").value=CONFIG.tables}
["sTaxIn","sSvcIn","sFoot","sTbl"].forEach(function(id){$(id).oninput=function(){
  
  CONFIG.taxRate=Math.max(0,parseFloat($("sTaxIn").value)||0)/100;CONFIG.serviceRate=Math.max(0,parseFloat($("sSvcIn").value)||0)/100;CONFIG.footer=$("sFoot").value;CONFIG.tables=Math.min(60,Math.max(1,parseInt($("sTbl").value)||12));
  db.set={cashier:CONFIG.cashier,currency:CONFIG.currency,taxRate:CONFIG.taxRate,serviceRate:CONFIG.serviceRate,footer:CONFIG.footer,tables:CONFIG.tables,theme:CONFIG.theme};
  save();renderCart();renderGrid();updateKpis()}});


/* ----- Currency & theme rows ----- */
var ICO={globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  cur:'<circle cx="12" cy="12" r="9"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6v2M12 16v2"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  mon:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  chk:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>'};
function sv(n,c){return '<svg class="ico'+(c?' '+c:'')+'" viewBox="0 0 24 24" aria-hidden="true">'+ICO[n]+'</svg>'}
var CURS=[["Egyptian Pound","EGP"],["US Dollar","$"],["Euro","€"],["Kuwaiti Dinar","KWD"],["UAE Dirham","AED"],["Saudi Riyal","SAR"],["British Pound","£"]], sOpen="";
function curList(){var l=CURS.slice();if(!l.some(function(c){return c[1]===CONFIG.currency}))l.push([CONFIG.currency,CONFIG.currency]);return l}
function sRows(){return [
  {k:"cur",ico:"cur",label:"Currency",val:CONFIG.currency,opts:curList().map(function(c){return [c[1],c[0]+" · "+c[1],null,c[1]]})},
  {k:"theme",ico:CONFIG.theme==="dark"?"moon":CONFIG.theme==="system"?"mon":"sun",label:"Theme",val:CONFIG.theme,opts:[["light","Light","sun"],["dark","Dark","moon"],["system","System","mon"]]}]}
function syncPrefs(){var el=$("setPrefs");if(!el)return;
  el.innerHTML=sRows().map(function(r){
    var cur=r.opts.filter(function(o){return o[0]===r.val})[0]||r.opts[0],open=sOpen===r.k;
    return '<div class="srow-wrap'+(open?' open':'')+'"><button type="button" class="srow" data-k="'+r.k+'" aria-expanded="'+open+'"><span class="sico">'+sv(r.ico)+'</span><b>'+r.label+'</b><span class="spill">'+(cur[3]||cur[1])+'</span></button>'+
      '<div class="smenu">'+r.opts.map(function(o,i){var on=o[0]===r.val;
        return '<button type="button" style="--i:'+i+'" class="sopt'+(on?' on':'')+'" data-k="'+r.k+'" data-val="'+o[0]+'">'+(o[2]?sv(o[2]):'')+'<span>'+o[1]+'</span>'+(on?sv("chk","ck"):'')+'</button>'}).join("")+'</div></div>'}).join("")}
function savePref(){db.set=db.set||{};db.set.theme=CONFIG.theme;db.set.currency=CONFIG.currency;save()}
function applyTheme(){var d=CONFIG.theme==="dark"||(CONFIG.theme==="system"&&window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme",d?"dark":"light")}
if(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").addEventListener)matchMedia("(prefers-color-scheme: dark)").addEventListener("change",applyTheme);
function setOpen(k){sOpen=k;[].forEach.call(document.querySelectorAll("#setPrefs .srow-wrap"),function(w){
  var on=w.firstChild.dataset.k===k;w.classList.toggle("open",on);w.firstChild.setAttribute("aria-expanded",on)})}
$("setPrefs").onclick=function(e){
  var o=e.target.closest(".sopt"),r=e.target.closest(".srow");
  if(o){var k=o.dataset.k,v=o.dataset.val;setOpen("");
    if(k==="theme"){CONFIG.theme=v;savePref();applyTheme()}
    if(k==="cur"){CONFIG.currency=v;savePref();renderCart();renderGrid();updateKpis()}
    setTimeout(syncPrefs,220);return}
  if(r)setOpen(sOpen===r.dataset.k?"":r.dataset.k)};
document.addEventListener("click",function(e){if(sOpen&&!e.target.closest("#setPrefs"))setOpen("")});
