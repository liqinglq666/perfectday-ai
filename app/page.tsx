const scenes = [
  ["date", "♥", "约会", "浪漫时光"],
  ["family", "◈", "亲子", "快乐遛娃"],
  ["parents", "♧", "陪爸妈", "轻松舒适"],
  ["friends", "●●", "朋友聚会", "吃喝玩乐"],
  ["solo", "☕", "独处", "享受自我"],
  ["rain", "☂", "雨天室内", "自在不受限"]
];

const sampleTrip = "/trip?scene=friends&duration=240&budget=500&walking=low&request=%E5%92%8C%E6%9C%8B%E5%8F%8B%E9%80%9B%E8%A1%97%E5%90%83%E9%A5%AD%EF%BC%8C4%E5%B0%8F%E6%97%B6%EF%BC%8C%E9%A2%84%E7%AE%97300-500%EF%BC%8C%E8%BF%98%E6%83%B3%E5%96%9D%E5%92%96%E5%95%A1";

export default function HomePage() {
  return (
    <div className="page home-page">
      <header className="brand-row">
        <div>
          <div className="brand">PerfectDay <span>AI</span><sup>✦</sup></div>
          <p>一键生成你的商圈完美半日</p>
        </div>
        <div className="product-badge"><strong>直接用</strong><small>无需登录</small></div>
      </header>

      <section className="hero-card">
        <div className="mall mall-left"><span>完美金鹰</span><small>品质消费与生活方式</small></div>
        <div className="hero-copy">一座城<br/>两种精彩<em>让每一天都更完美</em></div>
        <div className="mall mall-right"><span>假日广场</span><small>文化 · 阅读 · 生活美学</small></div>
      </section>

      <div className="location-pill">⌖ 中山 · 完美金鹰 × 假日广场 <span>已连通</span></div>

      <form action="/trip" className="planner-form">
        <section className="prompt-card">
          <div className="prompt-label-row"><label htmlFor="request">告诉我你今天想怎么玩…</label><span>可选</span></div>
          <textarea id="request" name="request" placeholder="例如：带爸妈逛4小时，预算300元，想喝咖啡，不想走太多路" />
          <p className="input-tip">一句话里的“约会 / 亲子 / 爸妈 / 下雨 / 预算 / 小时 / 少走路”等信息，会直接影响路线。</p>
        </section>

        <section className="section-block">
          <div className="section-heading"><h2>快速选择你的场景</h2><span>不想打字也可以直接选</span></div>
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

      <div className="trust-row"><span>✓ 核验核心地点</span><span>✓ 高德免费查看</span><span>✓ 不强制注册</span></div>

      <section className="promise-card" id="why">
        <strong>不是把一天排满，而是让你更轻松地做决定。</strong>
        <p>首版只做好路线、时间、预算、地点和临时调整。消费金额是规划估算，门店实际信息以现场与官方页面为准。</p>
      </section>

      <nav className="bottom-nav"><a className="active" href="/">⌂<span>首页</span></a><a href={sampleTrip}>▤<span>示例路线</span></a><a href="#why">♡<span>为什么</span></a></nav>
    </div>
  );
}
