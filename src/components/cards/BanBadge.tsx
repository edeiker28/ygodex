import type { BanlistInfo, BanFormat } from '../../types/ygo';

interface Props {
  banlistInfo?: BanlistInfo;
  format?: BanFormat;
}

const BAN_CONFIG = {
  Banned:         { icon: '🚫', label: 'Prohibida',  color: '#ef4444' },
  Limited:        { icon: '⚠',  label: 'Limitada',   color: '#f59e0b' },
  'Semi-Limited': { icon: '½',  label: 'Semi-Lim.',  color: '#3b82f6' },
} as const;

export default function BanBadge({ banlistInfo, format = 'tcg' }: Props) {
  if (!banlistInfo) return null;
  const status =
    format === 'tcg' ? banlistInfo.ban_tcg :
    format === 'ocg' ? banlistInfo.ban_ocg :
    banlistInfo.ban_goat;

  if (!status) return null;
  const cfg = BAN_CONFIG[status];

  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-body font-semibold px-1.5 py-0.5 rounded border"
      style={{ color: cfg.color, borderColor: `${cfg.color}55` }}
    >
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </span>
  );
}
