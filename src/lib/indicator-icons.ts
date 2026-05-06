export const defaultIndicatorIcon = "BadgeCheck";

export const indicatorIconOptions = [
  { name: "Activity", label: "Activity" },
  { name: "AlarmClock", label: "Alarm Clock" },
  { name: "BadgeCheck", label: "Badge Check" },
  { name: "Bell", label: "Bell" },
  { name: "BookOpenCheck", label: "Book Check" },
  { name: "Brain", label: "Brain" },
  { name: "CalendarCheck", label: "Calendar Check" },
  { name: "ChartCandlestick", label: "Candlestick" },
  { name: "ChartLine", label: "Line Chart" },
  { name: "CheckCircle2", label: "Check Circle" },
  { name: "CircleDollarSign", label: "Dollar Circle" },
  { name: "ClipboardCheck", label: "Clipboard Check" },
  { name: "Clock3", label: "Clock" },
  { name: "Compass", label: "Compass" },
  { name: "Crosshair", label: "Crosshair" },
  { name: "Diamond", label: "Diamond" },
  { name: "DollarSign", label: "Dollar" },
  { name: "Eye", label: "Eye" },
  { name: "Flag", label: "Flag" },
  { name: "Gauge", label: "Gauge" },
  { name: "Gem", label: "Gem" },
  { name: "Goal", label: "Goal" },
  { name: "Hash", label: "Hash" },
  { name: "HeartPulse", label: "Pulse" },
  { name: "Landmark", label: "Landmark" },
  { name: "Layers", label: "Layers" },
  { name: "ListChecks", label: "Checklist" },
  { name: "MapPin", label: "Map Pin" },
  { name: "Megaphone", label: "Megaphone" },
  { name: "MoveUpRight", label: "Move Up Right" },
  { name: "Percent", label: "Percent" },
  { name: "Radar", label: "Radar" },
  { name: "Rocket", label: "Rocket" },
  { name: "Scale", label: "Scale" },
  { name: "ShieldCheck", label: "Shield Check" },
  { name: "Signal", label: "Signal" },
  { name: "Sparkles", label: "Sparkles" },
  { name: "Star", label: "Star" },
  { name: "Target", label: "Target" },
  { name: "Timer", label: "Timer" },
] as const;

export type IndicatorIconName = (typeof indicatorIconOptions)[number]["name"];

export function isIndicatorIconName(value: string): value is IndicatorIconName {
  return indicatorIconOptions.some((icon) => icon.name === value);
}
