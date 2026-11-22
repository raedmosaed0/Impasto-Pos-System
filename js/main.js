/* Impasto POS — Start-up */
function tick(){var d=new Date();$("tbTime").textContent=d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});$("tbDate").textContent=d.toLocaleDateString([],{weekday:"short",day:"numeric",month:"short"})}
tick();setInterval(tick,15000);
buildMenu();
syncType();syncCust();renderCats();renderGrid();renderCart();updateKpis();
["oPay","nCat"].forEach(function(id){enhance($(id))});
applyTheme();

/* Hide menu photos that fail to load (replaces inline onerror handlers) */
document.addEventListener("error",function(e){var t=e.target;if(t&&t.tagName==="IMG")t.style.display="none"},true);
