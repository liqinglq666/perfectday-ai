import Icon from "@/app/components/ui-icon";

type Props = {
  valid: boolean;
  saving: boolean;
  count: number;
  totalPrice: number;
  onPreview: () => void;
};

export default function AdjustmentSavebar({ valid, saving, count, totalPrice, onPreview }: Props) {
  return <>
    <div className="adjust-savebar">
      <button className="mobile-preview-button" type="button" onClick={onPreview} disabled={!valid}>
        <Icon name="sliders" size={18}/>
        <span>看新路线<small>{valid ? `${count} 站 · ¥${totalPrice}` : "待填写"}</small></span>
      </button>
      <button className="primary-button use-route" form="remaining-form" type="submit" name="mode" value="save" disabled={!valid || saving} aria-busy={saving}>
        {saving ? <><span className="spinner"/>正在保存…</> : <>保存这次调整<Icon name="arrow"/></>}
      </button>
    </div>
    <p className="estimate-note">保存后可撤销上一步。已移除的地点不会自动重新加入。</p>
  </>;
}
