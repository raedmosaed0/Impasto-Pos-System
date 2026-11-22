/* Impasto POS — In-page confirm dialog */
var askCb=null;
function ask(title,text,okLabel,cb,danger){
  $("cfTitle").textContent=title;$("cfText").textContent=text;
  var ok=$("cfOk");ok.textContent=okLabel||"Confirm";ok.classList.toggle("danger",!!danger);
  askCb=cb;$("cfDlg").showModal();$("cfCancel").focus();
}
$("cfCancel").onclick=function(){askCb=null;$("cfDlg").close()};
$("cfOk").onclick=function(){var f=askCb;askCb=null;$("cfDlg").close();if(f)f()};
$("cfDlg").addEventListener("cancel",function(){askCb=null});
$("bClear").onclick=function(){if(Object.keys(cart).length)ask("Clear the order?",curTable&&db.held[curTable]?"The saved order for Table "+curTable+" will be cancelled too.":"All items in the current order will be removed.","Clear order",function(){logAct("clear","Cleared the order"+(curTable?" (Table "+curTable+")":""));if(curTable&&db.held[curTable])delete db.held[curTable];save();updateKpis();closing=true;animateOut(function(){clearOrder();closing=false})},true)};
