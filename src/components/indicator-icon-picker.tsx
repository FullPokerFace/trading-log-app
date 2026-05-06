"use client";

import IndicatorIcon from "@/components/indicator-icon";
import PickerDropdown from "@/components/ui/picker-dropdown";
import {
  indicatorIconOptions,
  type IndicatorIconName,
} from "@/lib/indicator-icons";

const iconOptions = indicatorIconOptions.map((icon) => ({
  value: icon.name,
  label: icon.label,
  icon: <IndicatorIcon name={icon.name} className="size-4 text-muted-foreground" />,
}));

export default function IndicatorIconPicker({
  value,
  onChange,
}: {
  value: IndicatorIconName;
  onChange: (value: IndicatorIconName) => void;
}) {
  return (
    <PickerDropdown
      value={value}
      options={iconOptions}
      onChange={onChange}
      label="Indicator icon"
      triggerLabel="Icon"
      triggerIcon={<IndicatorIcon name={value} className="size-4 text-muted-foreground" />}
      menuClassName="w-52"
      optionListClassName="grid grid-cols-5 gap-1"
      optionClassName="flex size-9 items-center justify-center p-0"
      renderOption={(option) => option.icon}
    />
  );
}
