/* Impasto POS — Custom dropdown */
var ddOpen=null;
function ddLabel(sel){var o=sel.options[sel.selectedIndex];return o?o.textContent:""}
function ddSync(sel){var dd=sel&&sel._dd;if(!dd)return;var t=ddLabel(sel),l=sel.getAttribute("aria-label");dd.btn.firstChild.textContent=t;if(l)dd.btn.setAttribute("aria-label",l+": "+t)}
function ddClose(){if(ddOpen){ddOpen.list.hidden=true;ddOpen.btn.setAttribute("aria-expanded","false");ddOpen=null}}
function ddAct(dd,i){var it=dd.list.children;if(!it.length)return;i=Math.max(0,Math.min(it.length-1,i));dd.act=i;
  [].forEach.call(it,function(x,k){x.classList.toggle("act",k===i)});if(it[i].scrollIntoView)it[i].scrollIntoView({block:"nearest"})}
function ddPick(sel,i){
  var dd=sel._dd;sel.selectedIndex=i;ddSync(sel);ddClose();
  sel.dispatchEvent(new Event("change",{bubbles:true}));
  if(document.body.contains(dd.btn))dd.btn.focus();
}
function ddShow(sel){
  var dd=sel._dd;if(sel.disabled)return;ddClose();
  dd.list.innerHTML=[].map.call(sel.options,function(o,i){return '<li role="option" data-i="'+i+'" aria-selected="'+(i===sel.selectedIndex)+'"'+(i===sel.selectedIndex?' class="on"':'')+'>'+esc(o.textContent)+'</li>'}).join("");
  dd.list.hidden=false;dd.btn.setAttribute("aria-expanded","true");ddOpen=dd;
  var r=dd.btn.getBoundingClientRect(),L=dd.list;
  L.style.minWidth=r.width+"px";L.style.left=r.left+"px";L.style.top=(r.bottom+6)+"px";
  var h=L.offsetHeight,w=L.offsetWidth;
  if(r.bottom+6+h>innerHeight-8&&r.top-6-h>8)L.style.top=(r.top-6-h)+"px";
  if(r.left+w>innerWidth-8)L.style.left=Math.max(8,innerWidth-8-w)+"px";
  ddAct(dd,sel.selectedIndex);
}
function enhance(sel){
  if(!sel)return;if(sel._dd){ddSync(sel);return}
  var wrap=document.createElement("div");wrap.className="dd";
  var btn=document.createElement("button");btn.type="button";btn.className="dd-btn";
  btn.setAttribute("aria-haspopup","listbox");btn.setAttribute("aria-expanded","false");
  btn.innerHTML='<span></span><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var list=document.createElement("ul");list.className="dd-list";list.setAttribute("role","listbox");list.hidden=true;
  wrap.appendChild(btn);wrap.appendChild(list);
  sel.parentNode.insertBefore(wrap,sel);sel.classList.add("dd-native");sel.tabIndex=-1;
  var dd=sel._dd={btn:btn,list:list,act:0};
  btn.onclick=function(){if(ddOpen===dd)ddClose();else ddShow(sel)};
  list.onclick=function(e){var li=e.target.closest("li");if(li)ddPick(sel,+li.dataset.i)};
  list.onmousemove=function(e){var li=e.target.closest("li");if(li&&+li.dataset.i!==dd.act)ddAct(dd,+li.dataset.i)};
  btn.onkeydown=function(e){
    var k=e.key;
    if(ddOpen!==dd){if(k==="ArrowDown"||k==="ArrowUp"){e.preventDefault();ddShow(sel)}return}
    if(k==="ArrowDown"){e.preventDefault();ddAct(dd,dd.act+1)}
    else if(k==="ArrowUp"){e.preventDefault();ddAct(dd,dd.act-1)}
    else if(k==="Home"){e.preventDefault();ddAct(dd,0)}
    else if(k==="End"){e.preventDefault();ddAct(dd,sel.options.length-1)}
    else if(k==="Enter"||k===" "){e.preventDefault();ddPick(sel,dd.act)}
    else if(k==="Escape"){e.preventDefault();e.stopPropagation();ddClose()}
    else if(k==="Tab")ddClose();
  };
  ddSync(sel);
}
document.addEventListener("click",function(e){if(ddOpen&&!e.target.closest(".dd"))ddClose()});
document.addEventListener("scroll",function(e){if(ddOpen&&!ddOpen.list.contains(e.target))ddClose()},true);
window.addEventListener("resize",ddClose);
