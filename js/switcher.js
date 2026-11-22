/* Impasto POS — Account switcher */
var swNames=[], swDD={btn:$("swBtn"),list:$("swMenu"),act:0};
function swRender(){
  var cur=CONFIG.cashier;swNames=staffNames();
  $("swMenu").innerHTML='<li class="swh" role="presentation">Switch account</li>'+swNames.map(function(n,i){
    var e=null;db.emp.forEach(function(x){if(x.name===n)e=x});
    return '<li role="menuitemradio" tabindex="0" data-i="'+i+'" aria-checked="'+(n===cur)+'"'+(n===cur?' class="on"':'')+'><span class="swav">'+avHTML(n)+'</span><span class="swn">'+esc(n)+'<small>'+esc(e?e.role:"Cashier")+(n===cur?' · On shift':'')+'</small></span></li>'}).join("");
}
function swShow(){
  ddClose();swRender();
  var L=$("swMenu"),m=$("me").getBoundingClientRect();
  L.hidden=false;$("swBtn").setAttribute("aria-expanded","true");ddOpen=swDD;
  L.style.minWidth=Math.max(230,m.width)+"px";L.style.left=Math.max(8,m.left)+"px";
  var h=L.offsetHeight;
  L.style.top=(m.top-8-h>8?m.top-8-h:Math.max(8,Math.min(innerHeight-h-8,m.bottom+8)))+"px";
  var on=L.querySelector("li.on");if(on)on.focus();
}
$("swBtn").onclick=function(){if(ddOpen===swDD)ddClose();else swShow()};
$("swMenu").onclick=function(e){
  var li=e.target.closest("[data-i]");if(!li)return;
  var n=swNames[+li.dataset.i];ddClose();$("swBtn").focus();
  if(n===CONFIG.cashier){toast(n+" is already on shift");return}
  needPin(n,function(){
    startShift(n);toast("Switched to "+n);
    if(!$("v-staff").hidden){stName=n;renderStaff()}
  });
};
$("swMenu").onkeydown=function(e){
  var items=[].slice.call(this.querySelectorAll("li[tabindex]")),i=items.indexOf(document.activeElement),k=e.key;
  if(k==="ArrowDown"){e.preventDefault();items[(i+1)%items.length].focus()}
  else if(k==="ArrowUp"){e.preventDefault();items[(i-1+items.length)%items.length].focus()}
  else if(k==="Enter"||k===" "){e.preventDefault();if(document.activeElement.click)document.activeElement.click()}
  else if(k==="Escape"){e.preventDefault();e.stopPropagation();ddClose();$("swBtn").focus()}
  else if(k==="Tab")ddClose();
};
$("me").onkeydown=function(e){if((e.key==="Enter"||e.key===" ")&&e.target===this){e.preventDefault();openStaff(CONFIG.cashier)}};
