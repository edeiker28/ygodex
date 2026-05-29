import { getTypeBg, getTypeColor } from '../../constants/typeColors';

interface Props {
  type: string;
  small?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  'Effect Monster': 'Monstruo',
  'Normal Monster': 'Normal',
  'Ritual Monster': 'Ritual',
  'Fusion Monster': 'Fusión',
  'Synchro Monster': 'Sincronía',
  'XYZ Monster': 'XYZ',
  'Link Monster': 'Link',
  'Pendulum Effect Monster': 'Péndulo',
  'Spell Card': 'Magia',
  'Trap Card': 'Trampa',
};

export default function TypeBadge({ type, small = false }: Props) {
  const bg = getTypeBg(type);
  const color = getTypeColor(type);
  const label = TYPE_LABELS[type] ?? type;

  return (
    <span
      className={`inline-flex items-center rounded font-body font-medium ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
}
