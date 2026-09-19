import {
  IconBeach,
  IconBuildingSkyscraper,
  IconMountain,
  IconRipple,
  IconWheat,
  IconWorld,
} from "@tabler/icons-react";

const REGION_ICONS = {
  world: IconWorld,
  central: IconBuildingSkyscraper,
  north: IconMountain,
  northeast: IconWheat,
  south: IconBeach,
  east: IconRipple,
  west: IconMountain,
} as const;

export type RegionIconName = keyof typeof REGION_ICONS;

interface RegionIconProps {
  name: RegionIconName;
  size?: number;
  className?: string;
}

export default function RegionIcon({ name, size = 16, className }: RegionIconProps) {
  const Icon = REGION_ICONS[name] || IconWorld;
  return <Icon size={size} stroke={2} className={className} aria-hidden="true" />;
}
