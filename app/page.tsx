import Image from "next/image";

const scenes = [
  ["date", "♥", "约会"],
  ["family", "◈", "亲子"],
  ["parents", "♧", "陪爸妈"],
  ["friends", "●●", "朋友"],
  ["solo", "☕", "独处"],
  ["rain", "☂", "雨天"]
];

const inspirations = [
  {
    title: "文艺咖啡半日",
    meta: "书店 · 咖啡 · 慢逛",
    image: "/visuals/bookstore.svg",
    href: "/trip?scene=solo&duration=240&budget=300&walking=low&request=%E6%83%B3%E9%80%9B%E4%B9%A6%E5%BA%97%E3%80%81%E5%96%9D%E5%92%96%E5%95%A1%EF%BC%8C%E8%BD%BB%E6%9D%BE%E4%B8%80%E7%82%B9"
  },
  {
    title: "亲子轻松逛",
    meta: "室内 · 遛娃 · 少走路",
    image: "/visuals/family.svg",
    href: "/trip?scene=family&duration=240&budget=500&walking=low&request=%E5%B8%A6%E5%AD%A9%E5%AD%90%E9%80%9B4%E5%B0%8F%E6%97%B6%EF%BC%8C%E5%B0%BD%E9%87%8F%E5%AE%A4%E5%86%85%EF%BC%8C%E5%B0%91%E8%B5%B0%E8%B7%AF"
  },
  {
    title: "朋友潮玩路线",
    meta: "互动 · 咖啡 · 晚餐",
    image: "/visuals/activity.svg",
    href: "/trip?scene=friends&duration=240&budget=500&walking=low&request=%E5%92%8C%E6%9C%8B%E5%8F%8B%E6%83%B3%E7%8E%A9%E6%B8%B8%E6%88%8F%E6%88%96%E8%BF%90%E5%8A%A8%EF%BC%8C%E5%86%8D%E5%96%9D%E5%92%96%E5%95%A1%E5%90%83%E6%99%9A%E9%A5%AD"
  }
];

export default function HomePage() {
  return (
    <div className="page home-page">
      <header className="brand-row">
        <div>
          <div className="brand">PerfectDay <span>AI</span><sup>✦</sup></div>
          <p>一键生成你的商圈半日路线</p>
        </div>
      </header>

      <section className="hero-card visual-hero">
        <Image className="hero-image" src="/visuals/hero-dual-mall.svg" alt="完美金鹰与假日广场双商圈" fill priority sizes="430px" />
        <div className="hero-overlay"><small>中山 · 石岐</small><strong>完美金鹰 × 假日广场</strong></div>
      </section>

      <form action="/trip" className="planner-form compact-planner">
        <section className="prompt-card compact-prompt">
          <label htmlFor="request">今天想怎么玩？</label>
          <input id="request" name="request" type="text" autoComplete="off" placeholder="带爸妈逛4小时，预算300元，想喝咖啡，少走路" />
        </section>

        <section className="section-block compact-section">
          <div className="section-heading"><h2>和谁一起？</h2></div>
          <div className="scene-grid compact-scenes">
            {scenes.map(([value, icon, label], index) => (
              <label className="scene-option" key={value}>
                <input type="radio" name="scene" value={value} defaultChecked={index === 3} />
                <span className="scene-card"><b>{icon}</b><strong>{label}</strong></span>
              </label>
            ))}
          </div>
        </section>

        <section className="section-block compact-section">
          <div className="section-heading"><h2>今天的节奏</h2></div>
          <div className="preferences">
            <label><small>◷ 时长</small><select name="duration" defaultValue="240"><option value="120">2小时</option><option value="240">4小时</option><option value="360">6小时</option></select></label>
            <label><small>¥ 预算</small><select name="budget" defaultValue="500"><option value="100">¥100内</option><option value="300">¥100-300</option><option value="500">¥300-500</option><option value="plus">¥500+</option></select></label>
            <label><small>♙ 步行</small><select name="walking" defaultValue="low"><option value="normal">正常</option><option value="low">少走路</option></select></label>
          </div>
        </section>

        <button className="primary-button main-cta" type="submit">生成行程 <span>→</span></button>
      </form>

      <section className="inspiration-section" id="inspiration">
        <div className="section-heading"><h2>路线灵感</h2></div>
        <div className="inspiration-scroll">
          {inspirations.map((item) => (
            <a className="inspiration-card" href={item.href} key={item.title}>
              <Image src={item.image} alt="" width={180} height={112} />
              <div><strong>{item.title}</strong><span>{item.meta}</span></div>
            </a>
          ))}
        </div>
      </section>

      <section className="pwa-tip">
        <div><b>⌂</b><span><strong>添加到主屏幕</strong><small>下次打开更方便。</small></span></div>
        <span className="pwa-arrow">→</span>
      </section>
    </div>
  );
}
