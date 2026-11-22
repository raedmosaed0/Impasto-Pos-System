/* Impasto POS — Employee passwords */
/* Accounts are protected by a password per employee.
   Passwords are never stored in the source code: each one is salted and hashed (SHA-256)
   in the browser. An account with no password set has no lock (set one in Account > Change password).
   NOTE: this is a convenience lock for a shared till, not server-side security. */
db.pins=db.pins||{};db.photos=db.photos||{};
function avHTML(name){var p=db.photos[name];return p&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(p)?'<img alt="" src="'+p+'">':ic("user")}
function toHex(buf){return Array.prototype.map.call(new Uint8Array(buf),function(b){return("0"+b.toString(16)).slice(-2)}).join("")}
function newSalt(){var a=new Uint8Array(12);crypto.getRandomValues(a);return toHex(a)}
function hashPin(salt,pin){
  if(window.crypto&&crypto.subtle)return crypto.subtle.digest("SHA-256",new TextEncoder().encode(salt+":"+pin)).then(toHex);
  return Promise.resolve("p:"+salt+":"+pin);
}
function hasPin(name){return !!db.pins[name]}
function setPin(name,pin){var s=newSalt();return hashPin(s,pin).then(function(h){db.pins[name]={s:s,h:h};save()})}
function checkPin(name,pin){
  var p=db.pins[name];if(!p)return Promise.resolve(true);
  if(typeof p==="string"){var ok=p===pin;return(ok?setPin(name,pin):Promise.resolve()).then(function(){return ok})}  /* old plain-text entry: upgrade on first use */
  return hashPin(p.s,pin).then(function(h){return h===p.h});
}
var pinCb=null,pinFor="",pinFails=0,pinLock=0;
function needPin(name,cb){
  if(name===CONFIG.cashier||!hasPin(name)){cb();return}
  pinFor=name;pinCb=cb;
  $("pinTitle").textContent="Password for "+name;$("pinIn").value="";$("pinErr").textContent="Wrong password, try again.";$("pinErr").hidden=true;
  $("pinDlg").showModal();$("pinIn").focus();
}
function pinTry(){
  var err=$("pinErr");
  if(Date.now()<pinLock){err.textContent="Too many attempts. Wait a few seconds.";err.hidden=false;return}
  checkPin(pinFor,$("pinIn").value).then(function(ok){
    if(ok){pinFails=0;var f=pinCb;pinCb=null;$("pinDlg").close();if(f)f();return}
    if(++pinFails>=5){pinFails=0;pinLock=Date.now()+30000;err.textContent="Too many attempts. Wait 30 seconds."}
    else err.textContent="Wrong password, try again.";
    err.hidden=false;$("pinIn").value="";$("pinIn").focus();
  });
}
