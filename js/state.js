/* Impasto POS — State and local storage */
var $=function(id){return document.getElementById(id)};
var curTable="", curCust=0, flash={}, cart={}, type="Dine-in", method="Cash", cat="All", total=0, calc={};
var KEY="impasto_pos_v1", db={orders:[],next:1};
try{var s=localStorage.getItem(KEY); if(s) db=JSON.parse(s)}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}}
db.ov=db.ov||{};db.held=db.held||{};db.inv=db.inv||[];db.days=db.days||[];db.occ=db.occ||{};db.log=db.log||[];db.cs=db.cs||{};db.shift=db.shift||{ts:Date.now()};
db.cust=db.cust||[];var _mx=0;db.cust.forEach(function(c){if(c.id>_mx)_mx=c.id});db.cust.forEach(function(c){if(!c.id)c.id=++_mx});db.emp=db.emp||[];db.custom=db.custom||[];db.set=db.set||{};Object.assign(CONFIG,db.set);CONFIG.cashier=CONFIG.cashier||"Cashier";
