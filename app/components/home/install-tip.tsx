import Icon from "@/app/components/ui-icon";

export default function InstallTip() {
  return <details className="install-tip">
    <summary>
      <Icon name="phone"/>
      <span>把 PerfectDay 放到手机桌面<small>下次出门，一点就打开</small></span>
      <span className="detail-plus">+</span>
    </summary>
    <p>iPhone：在 Safari 中打开，点“分享” → “添加到主屏幕”。<br/>Android：在浏览器菜单中选择“添加到主屏幕”或“安装应用”。具体名称随浏览器而异。</p>
  </details>;
}
