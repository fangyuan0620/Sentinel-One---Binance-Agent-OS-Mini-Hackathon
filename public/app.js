const $ = id => document.getElementById(id);
setInterval(() => { $("clock").textContent = new Date().toLocaleTimeString("zh-CN", { hour12:false }); }, 1000);

function money(n, digits=2) { return `$${Number(n).toLocaleString("en-US", { maximumFractionDigits:digits, minimumFractionDigits:digits })}`; }
function render(data) {
  $("empty").hidden = true; $("output").hidden = false; $("source").textContent = `${data.audit.dataSource} · ${new Date(data.audit.createdAt).toLocaleTimeString("zh-CN")}`;
  $("stance").textContent = data.stance; $("confidence").textContent = `${data.confidence}%`; $("summary").textContent = data.summary;
  const m = data.market, i = data.indicators;
  $("metrics").innerHTML = [["现价", money(m.price, m.price>1000?0:2)], ["24H 变化", `${m.change24h.toFixed(2)}%`], ["RSI 14", i.rsi14.toFixed(1)], ["ATR 波动", `${(i.atr14/m.price*100).toFixed(2)}%`]].map(x=>`<div class="metric"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
  const p=data.plan; $("plan").innerHTML = [["观察入场", money(p.entry, p.entry>1000?0:2)], ["保护止损", money(p.stop, p.stop>1000?0:2)], ["潜在目标", money(p.target, p.target>1000?0:2)], ["计划名义", money(p.notional)]].map(x=>`<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
  $("checks").innerHTML = data.checks.map(c=>`<div class="check"><span>${c.label} <small>${c.detail}</small></span><b class="${c.pass?'pass':'fail'}">${c.pass?'PASS':'BLOCK'}</b></div>`).join("");
  $("risks").innerHTML = data.risks.map(r=>`<li>${r}</li>`).join("");
}
$("analyze").addEventListener("click", async () => { const b=$("analyze"); b.disabled=true; b.textContent="扫描中…"; try { const r=await fetch("/api/analyze", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ symbol:$("symbol").value, portfolio:$("portfolio").value, riskPercent:$("risk").value, question:$("question").value }) }); const d=await r.json(); if(!r.ok) throw new Error(d.error); render(d); } catch(e) { alert(e.message); } finally { b.disabled=false; b.innerHTML="运行风险扫描 <span>↗</span>"; } });
