import { getImageProps } from "next/image";
import Icon from "@/app/components/ui-icon";

/** Art direction: one image request, using the two existing hero assets. */
export default function HomeHero() {
  const alt = "完美金鹰与假日商圈拼贴风格体验示意，非精确建筑或室内动线";
  const { props: desktop } = getImageProps({ src: "/images/ui/hero/hero-home-desktop.webp", alt, width: 1600, height: 900, sizes: "(max-width: 1000px) 50vw, 560px", loading: "eager" });
  const { props: mobile } = getImageProps({ src: "/images/ui/hero/hero-home-mobile.webp", alt, width: 900, height: 1200, sizes: "calc(100vw - 32px)" });
  return <figure className="home-hero">
    <picture>
      <source media="(max-width: 760px)" srcSet={mobile.srcSet} sizes={mobile.sizes}/>
      {/* getImageProps supplies optimized src/srcSet; picture selects one asset. */}
      <img {...desktop} className="hero-art"/>
    </picture>
    <span className="hero-index" aria-hidden="true">EXPLORE YOUR PERFECT DAY</span>
    <figcaption className="hero-float-tag"><Icon name="pin" size={15}/>一片商圈 · 两种气质</figcaption>
  </figure>;
}
