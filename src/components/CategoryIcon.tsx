import {
  TrendingUp,
  BrainCircuit,
  LayoutGrid,
  Home,
  Code2,
  Printer,
  Package,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  TrendingUp,
  BrainCircuit,
  LayoutGrid,
  Home,
  Code2,
  Printer,
  Package,
};

interface CategoryIconProps extends LucideProps {
  name: string;
}

export default function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const Icon = iconMap[name] || Package;
  return <Icon {...props} />;
}
