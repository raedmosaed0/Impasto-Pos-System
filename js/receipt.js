/* Impasto POS — Receipt printing */
function printReceipt(o){
  var d=new Date(o.ts);
  var r=function(a,b){return '<div class="r"><span>'+a+'</span><span>'+b+'</span></div>'};
  var h='<h3>'+esc(CONFIG.name)+'</h3><div class="c">Order #'+o.no+'<br>'+d.toLocaleString()+'<br>'+esc(o.type)+(o.ref?' · '+esc(o.ref):'')+(o.custName?'<br>Customer: '+esc(o.custName):'')+(o.cashier?'<br>Cashier: '+esc(o.cashier):'')+'</div><hr>';
  o.items.forEach(function(i){h+=r(i.qty+" × "+esc(i.name),money(i.price*i.qty));if(i.opts)h+='<div style="padding-left:14px;font-size:11px">'+esc(i.opts)+'</div>'});
  h+='<hr>'+r("Subtotal",money(o.sub));
  if(o.disc)h+=r("Discount ("+o.pct+"%)","−"+money(o.disc));
  if(o.svc)h+=r("Service",money(o.svc));
  h+=r(CONFIG.taxLabel,money(o.tax))+'<hr><b>'+r("TOTAL",money(o.total))+'</b>';
  (o.pays||[{m:o.method,a:o.tender}]).forEach(function(p){h+=r(PL(p.m),money(p.a))});
  if(o.change>0.004)h+=r("Change",money(o.change));
  h+='<hr><div class="c">'+esc(CONFIG.footer)+'</div>';
  var fr=document.createElement("iframe");fr.setAttribute("aria-hidden","true");
  fr.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(fr);
  var d=fr.contentWindow.document;d.open();
  d.write('<!doctype html><html><head><meta charset="utf-8"><title>Receipt #'+o.no+'</title><style>@page{margin:4mm}body{font:12px/1.5 monospace;color:#000;width:72mm;margin:0 auto}h3{text-align:center;margin:0;font-size:16px}.c{text-align:center}.r{display:flex;justify-content:space-between}hr{border:0;border-top:1px dashed #000}<\/style></head><body>'+h+'</body></html>');
  d.close();
  setTimeout(function(){try{fr.contentWindow.focus();fr.contentWindow.print()}catch(e){}setTimeout(function(){if(fr.parentNode)fr.parentNode.removeChild(fr)},800)},450);
}
