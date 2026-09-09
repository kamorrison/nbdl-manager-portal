/* One static data source for the manager portal and WordPress embeds. */
(() => {
  'use strict';
  const script = document.currentScript;
  const view = script.dataset.view;
  const base = new URL('data/', script.src);
  const status = document.getElementById('ledger-status');
  const filters = document.getElementById('ledger-filters');
  const results = document.getElementById('ledger-results');
  const node = (tag, text, cls) => { const n=document.createElement(tag); if(text!==undefined)n.textContent=text; if(cls)n.className=cls; return n; };
  Promise.all(['franchise_aliases','trades','current_draft_pick_ownership','trade_data_health','trade_review_queue'].map(async name => {
    const r=await fetch(new URL(name+'.json',base)); if(!r.ok)throw Error('Unable to load '+name); return r.json();
  })).then(([teams,trades,picks,health,review]) => {
    const names=Object.fromEntries(teams.map(t=>[t.franchise_id,t.current_team_name]));
    const name=id=>names[id]||'Not established';
    const fields={};
    function select(key,label,options) {
      const wrap=node('label',label+' '), s=node('select'); s.id='ledger-'+key;
      s.append(new Option('All','')); options.forEach(([v,t])=>s.append(new Option(t,v)));
      s.addEventListener('change',render); wrap.append(s); filters.append(wrap); fields[key]=s;
    }
    const val=k=>fields[k]?.value||'';
    const unique=(list)=>[...new Set(list.filter(x=>x!==null && x!==undefined))].sort().map(x=>[String(x),String(x)]);
    select('team','Franchise',teams.map(t=>[t.franchise_id,t.current_team_name]));
    if(view==='picks') select('year','Draft year',unique(picks.map(p=>p.draft_year)));
    if(view==='trades') {
      select('season','Season',unique(trades.map(t=>t.season)));
      select('year','Draft year',unique(trades.flatMap(t=>t.assets.map(a=>a.draft_year))));
      select('type','Asset type',[['player','Player'],['draft_pick','Draft pick'],['cash','FAAB / cash'],['other','Other / swap']]);
      const label=node('label','Player '), input=node('input'); input.type='search'; input.placeholder='Player name'; input.addEventListener('input',render); label.append(input); filters.append(label); fields.player=input;
    }
    function assetLabel(a) {
      if(a.asset_type==='player') return a.player_name;
      if(a.asset_type==='draft_pick') return `${a.draft_year||'Year unknown'} R${a.round||'?'} — ${a.original_owner?name(a.original_owner):'Original franchise unknown'} (${a.raw_asset||'pick'})`;
      return a.description||a.raw_asset||`${a.amount} ${a.currency}`;
    }
    function sourceDetails(t) {
      const d=node('details'), s=node('summary','Source evidence'); d.append(s);
      t.sources.forEach(src=>d.append(node('p',`${src.source}: ${src.source_reference}`,'muted'))); return d;
    }
    function tradeCard(t) {
      const c=node('article',undefined,'card'); c.id=t.trade_id;
      c.append(node('h2',t.date||'Date needs review'),node('p',t.excluded?'Excluded by correction':t.confidence.replaceAll('_',' ').toUpperCase(),t.problems.length?'warning':'muted'));
      t.teams.forEach(f=>{
        c.append(node('h3',name(f)+' receives'));
        const ul=node('ul'); t.assets.filter(a=>a.to_team===f).forEach(a=>ul.append(node('li',assetLabel(a)+(a.confirmation?' — CONFIRMED':''))));
        if(!ul.children.length)ul.append(node('li','No assets specified')); c.append(ul);
      });
      if(t.problems.length)c.append(node('p',t.problems.join('; '),'warning'));
      c.append(sourceDetails(t)); return c;
    }
    function render() {
      results.replaceChildren();
      status.textContent=health.publication_ready?'Ownership verified against the approved ledger.':`NEEDS REVIEW · ${health.correctly_assigned} picks confirmed; ${health.unresolved} picks still unverified. Confirmed moves are applied. Other published owners are retained.`;
      status.className=health.publication_ready?'notice valid':'notice warning';
      if(view==='picks') {
        const shown=picks.filter(p=>(!val('year')||String(p.draft_year)===val('year'))&&(!val('team')||[p.original_owner,p.current_owner,p.candidate_owner].includes(val('team'))));
        shown.forEach(p=>{
          const d=node('details',undefined,'card'), s=node('summary');
          const label=p.current_owner===p.original_owner?'Own Pick':p.current_owner?'Acquired Pick':'Ownership unverified';
          const away=val('team')===p.original_owner&&p.current_owner&&p.current_owner!==p.original_owner;
          s.textContent=`${p.draft_year} R${p.round} — ${name(p.original_owner)} · ${away?'Traded Away':label} · ${p.status.replaceAll('_',' ')}`; d.append(s);
          d.append(node('p',`Published owner: ${name(p.current_owner)}`),node('p',`Replay candidate (not official unless verified): ${name(p.candidate_owner)}`),node('p','Original owner: '+name(p.original_owner)));
          const ol=node('ol'); ol.append(node('li','Original allocation: '+name(p.original_owner)));
          p.trade_history.forEach(h=> {const li=node('li',`${h.date}: ${name(h.from_team)} → ${name(h.to_team)} `); const a=node('a','View trade'); a.href='../trades/index.html#'+h.trade_id; li.append(a); ol.append(li);});
          d.append(ol);
          if(!p.trade_history.length)d.append(node('p','No replayed transfers. This does not establish that no trade occurred.','muted'));
          results.append(d);
        });
        if(!shown.length)results.append(node('p','No picks match these filters.'));
      } else if(view==='trades') {
        const shown=trades.filter(t=>(!val('team')||t.teams.includes(val('team')))&&(!val('season')||t.season===val('season'))&&(!val('year')||t.assets.some(a=>String(a.draft_year)===val('year')))&&(!val('type')||t.assets.some(a=>a.asset_type===val('type')))&&(!val('player')||t.assets.some(a=>a.player_name?.toLowerCase().includes(val('player').toLowerCase()))));
        shown.slice().reverse().forEach(t=>results.append(tradeCard(t)));
        if(!shown.length)results.append(node('p','No trades match these filters.'));
      } else {
        const grid=node('div',undefined,'grid');
        [['Canonical trades',health.canonical_trades],['Confirmed',health.confirmed],['Trades needing review',health.needs_review],['Picks expected',health.expected_picks],['Picks verified',health.correctly_assigned],['Transfer conflicts',health.conflicts],['Duplicates merged',health.duplicates_merged],['Player mismatches',health.player_mismatches]].forEach(([k,v])=>{const c=node('div',undefined,'card');c.append(node('div',k),node('strong',String(v),'kpi'));grid.append(c);});results.append(grid);
        review.filter(q=>!val('team')||!q.teams||q.teams.includes(val('team'))).forEach(q=>{const c=node('article',undefined,'card');c.append(node('h3',q.trade_id||q.category),node('p',q.reason,'warning'));if(q.trade_id){const a=node('a','Review trade');a.href='../trades/index.html#'+q.trade_id;c.append(a);}results.append(c);});
      }
    }
    render();
    if(location.hash)document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }).catch(error=>{status.textContent='League records could not be loaded. Please reload or contact the commissioner. '+error.message;status.className='notice error';});
})();
