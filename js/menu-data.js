/* Impasto POS — Menu, sizes and add-ons */
var CATS = {Pizza:"#f05a28",Pasta:"#e0a526",Starters:"#6b8e3d",Desserts:"#b5527a",Drinks:"#3a7ca5"};
var IDS=["1574071318508-1cdbab80d002","1628840042765-356cda07504e","1513104890138-7c749659a591","1565299624946-b28f40a0ae38","1604382354936-07c5d9983bd3","1595854341625-f33ee10dbf94","1612874742237-6526221588e3","1621996346565-e3dbc646d9a9","1608756687911-aa1599ab3bd9","1645112411341-6c4fd023714a","1473093295043-cdd812d0e601","1574894709920-11b28e7367e3",
 "1572695157366-5e585ab2b69f","1608897013039-887f21d8c804","1637806930600-37fa8892069d","1571877227200-a0d98ea607e9","1488477181946-6428a0291777","1579954115545-a95591f28bfc","1621263764928-df1444c5e859","1556679343-c7306c1976bc","1510707577719-ae7c14805e3a"];
var BADGE={"Margherita":"Best Seller","Diavola":"Spicy","Pepperoni":"Popular","Vegetariana":"Veggie","Penne all’Arrabbiata":"Spicy","Pesto Genovese":"Veggie","Lasagna della Casa":"Best Seller"};
function ic(n){return '<svg class="ico" aria-hidden="true"><use href="#i-'+n+'"/></svg>'}
var EMO={Pizza:ic("pizza"),Pasta:ic("pasta"),Starters:ic("starter"),Desserts:ic("dessert"),Drinks:ic("drink")};
function photo(i,w){return IDS[i]?"https://images.unsplash.com/photo-"+IDS[i]+"?auto=format&fit=crop&w="+w+"&q=80":""}
function pic(m,w){return IDS[m.id]?'<img loading="lazy" alt="'+esc(m.name)+'" src="'+photo(m.id,w)+'">':''}
var BASE = [
 ["Margherita","Pizza",14],["Diavola","Pizza",17],["Quattro Formaggi","Pizza",17],["Prosciutto e Funghi","Pizza",18],["Pepperoni","Pizza",16],["Vegetariana","Pizza",16],
 ["Spaghetti Carbonara","Pasta",18],["Tagliatelle al Ragù","Pasta",19],["Penne all’Arrabbiata","Pasta",15],["Fettuccine Alfredo","Pasta",17],["Pesto Genovese","Pasta",16],["Lasagna della Casa","Pasta",20],
 ["Bruschetta al Pomodoro","Starters",8],["Burrata & Tomatoes","Starters",12],["Arancini","Starters",9],
 ["Tiramisù","Desserts",9],["Panna Cotta","Desserts",8],["Affogato","Desserts",7],
 ["Italian Lemonade","Drinks",5],["Mint Iced Tea","Drinks",5],["Espresso","Drinks",3]
].map(function(m,i){return {id:i,name:m[0],cat:m[1],price:m[2],badge:BADGE[m[0]]||""}});
var MENU=[];
function buildMenu(){
  MENU=BASE.map(function(b){var o=db.ov[b.name]||{};return {id:b.id,name:b.name,cat:b.cat,badge:b.badge,price:o.price!=null?o.price:b.price,off:!!o.off}});
  db.custom.forEach(function(c,k){MENU.push({id:BASE.length+k,name:c.name,cat:c.cat,badge:"",price:c.price,off:!!c.off,custom:true})});
}


var SIZES={
 Pizza:[["Small",-3],["Medium",0],["Large",4]],
 Pasta:[["Regular",0],["Large",4]],
 Drinks:[["Small",-1],["Medium",0],["Large",1.5]]
};
var EXTRAS={
 Pizza:[["Extra cheese",2],["Mushrooms",1.5],["Olives",1],["Pepperoni",2.5]],
 Pasta:[["Extra parmesan",1.5],["Grilled chicken",3],["Garlic bread",2]],
 Starters:[["Extra sauce",1]],
 Desserts:[["Chocolate sauce",1],["Extra scoop of ice cream",2]],
 Drinks:[["Extra ice",0],["Lemon slice",0.5]]
};
function sizesOf(m){return SIZES[m.cat]||[]}
function extrasOf(m){return EXTRAS[m.cat]||[]}
function defSize(m){var s=sizesOf(m);if(!s.length)return "";for(var i=0;i<s.length;i++)if(s[i][1]===0)return s[i][0];return s[0][0]}
function sizeDelta(m,n){var s=sizesOf(m);for(var i=0;i<s.length;i++)if(s[i][0]===n)return s[i][1];return 0}
function extraPrice(m,n){var e=extrasOf(m);for(var i=0;i<e.length;i++)if(e[i][0]===n)return e[i][1];return 0}
function unitPrice(m,size,ex){var p=m.price+sizeDelta(m,size);ex.forEach(function(x){p+=extraPrice(m,x)});return Math.max(0,p)}
function lowPrice(m){var s=sizesOf(m);if(!s.length)return m.price;return Math.max(0,m.price+Math.min.apply(null,s.map(function(x){return x[1]})))}
