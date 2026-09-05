const scenes = [
  ["date", "♥", "约会", "浪漫时光"],
  ["family", "◈", "亲子", "快乐遛娃"],
  ["parents", "♧", "陪爸妈", "轻松舒适"],
  ["friends", "●●", "朋友聚会", "吃喝玩乐"],
  ["solo", "☕", "独处", "享受自我"],
  ["rain", "☂", "雨天室内", "自在不受限"]
];

export default function HomePage() {
  return (
    <div className="page home-page">
      <header className="brand-row">
        <div>
          <div className="brand">PerfectDay <span>AI</span><sup>✦</sup></div>
          <p>一键生成你的商圈完美半日</p>
        </div>
        <div className="weather">☀ <strong>26°</strong><small>今天适合出发</small></div>
      </header>

      <section className="hero-card">
        <div className="mall mall-left"><span>完美金鹰</span><small>时尚生活新主场</small></div>
        <div className="hero-copy">一座城<br/>两种精彩<em>让每一天都更完美</em></div>
        <div className="mall mall-right"><span>假日广场</span><small>城市乐享聚集地</small></div>
      </section>

      <div className="location-pill">⌖ 中山 · 金鹰亚洲 × 假日广场 <span>⌄</span></div>

      <form action="/trip" className="planner-form">
        <section className="prompt-card">
          <label htmlFor="request">告诉我你今天想怎么玩…</label>
          <textarea id="request" name="request" placeholder="例如：和朋友逛街吃饭，4小时，预算300-500，还想喝咖啡" />
        </section>

        <section className="section-block">
          <div className="section-heading"><h2>快速选择你的场景</h2><span>选一个最接近今天的你</span></div>
          <div className="scene-grid">
            {scenes.map(([value, icon, label, sub], index) => (
              <label className="scene-option" key={value}>
                <input type="radio" name="scene" value={value} defaultChecked={index === 3} />
                <span className="scene-card"><b>{icon}</b><strong>{label}</strong><small>{sub}</small></span>
              </label>
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading"><h2>设置偏好条件</h2><span>三个选项就够了</span></div>
          <div className="preferences">
            <label><small>◷ 游玩时长</small><select name="duration" defaultValue="240"><option value="120">2小时</option><option value="240">4小时</option><option value="360">6小时</option></select></label>
            <label><small>¥ 预算范围</small><select name="budget" defaultValue="500"><option value="100">¥100以内</option><option value="300">¥100-300</option><option value="500">¥300-500</option><option value="plus">¥500+</option></select></label>
            <label><small>♙ 步行偏好</small><select name="walking" defaultValue="low"><option value="normal">正常走</option><option value="low">少走路</option></select></label>
          </div>
        </section>

        <button className="primary-button" type="submit">✦ 生成我的 PerfectDay <span>→</span></button>
      </form>

      <section className="promise-card">
        <strong>简单一点，反而更好用。</strong>
        <p>首版只帮你做好路线、时间、预算和临时调整，不做复杂会员与室内导航。</p>
      </section>

      <nav className="bottom-nav"><a className="active" href="/">⌂<span>首页</span></a><a href="#how">▤<span>路线</span></a><a href="#about">♡<span>关于</span></a></nav>
    </div>
  );
}
