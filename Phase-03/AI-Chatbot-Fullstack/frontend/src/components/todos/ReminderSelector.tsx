"use client";

/**
 * Reminder selector component for setting todo reminders.
 *
 * Task Reference: T057 [US2] - Create ReminderSelector component
 * Feature: 006-recurring-reminders
 *
 * Allows users to set reminders with preset offsets or custom times.
 */

import { useState } from "react";
import {
  REMINDER_OFFSET_VALUES,
  REMINDER_OFFSET_LABELS,
  type ReminderOffsetPreset,
} from "@/types/reminder";

interface ReminderSelectorProps {
  /** Selected reminder offset in minutes (negative) */
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  /** Whether a due date is set (reminders require due date) */
  hasDueDate?: boolean;
}

const PRESET_OPTIONS: { value: ReminderOffsetPreset; label: string }[] = [
  { value: "at_time", label: REMINDER_OFFSET_LABELS.at_time },
  { value: "15_min", label: REMINDER_OFFSET_LABELS["15_min"] },
  { value: "30_min", label: REMINDER_OFFSET_LABELS["30_min"] },
  { value: "1_hour", label: REMINDER_OFFSET_LABELS["1_hour"] },
  { value: "1_day", label: REMINDER_OFFSET_LABELS["1_day"] },
  { value: "1_week", label: REMINDER_OFFSET_LABELS["1_week"] },
];

/**
 * Component for selecting reminder timing.
 *
 * Task Reference: T057 [US2]
 */
export function ReminderSelector({
  value,
  onChange,
  disabled = false,
  hasDueDate = false,
}: ReminderSelectorProps) {
  const [hasReminder, setHasReminder] = useState(value !== null);
  const [selectedPreset, setSelectedPreset] = useState<ReminderOffsetPreset | "custom">(
    value !== null ? getPresetFromValue(value) : "30_min"
  );
  const [customMinutes, setCustomMinutes] = useState(30);

  // Find the preset that matches the value
  function getPresetFromValue(minutes: number): ReminderOffsetPreset | "custom" {
    for (const [key, val] of Object.entries(REMINDER_OFFSET_VALUES)) {
      if (val === minutes) return key as ReminderOffsetPreset;
    }
    return "custom";
  }

  const handleToggle = (enabled: boolean) => {
    setHasReminder(enabled);
    if (enabled) {
      const minutes = selectedPreset === "custom"
        ? -customMinutes
        : REMINDER_OFFSET_VALUES[selectedPreset];
      onChange(minutes);
    } else {
      onChange(null);
    }
  };

  const handlePresetChange = (preset: ReminderOffsetPreset | "custom") => {
    setSelectedPreset(preset);
    if (hasReminder) {
      if (preset === "custom") {
        onChange(-customMinutes);
      } else {
        onChange(REMINDER_OFFSET_VALUES[preset]);
      }
    }
  };

  const handleCustomChange = (minutes: number) => {
    setCustomMinutes(minutes);
    if (hasReminder && selectedPreset === "custom") {
      onChange(-minutes);
    }
  };

  // Show message if no due date
  if (!hasDueDate) {
    return (
      <div className="text-sm text-gray-500 italic">
        Set a due date to add reminders
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Toggle for reminder */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={hasReminder}
          onChange={(e) => handleToggle(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">
          Remind me
        </span>
      </label>

      {hasReminder && (
        <div className="pl-6 space-y-2">
          {/* Preset selector */}
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value as ReminderOffsetPreset | "custom")}
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            {PRESET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            <option value="custom">Custom...</option>
          </select>

          {/* Custom input */}
          {selectedPreset === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={10080}
                value={customMinutes}
                onChange={(e) => handleCustomChange(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={disabled}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <span className="text-sm text-gray-600">minutes before</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact reminder badge for display.
 *
 * Task Reference: T060 [US2]
 */
export function ReminderBadge({
  offsetMinutes,
  fireAt,
}: {
  offsetMinutes?: number | null;
  fireAt?: string | null;
}) {
  let label = "Reminder set";

  if (offsetMinutes !== null && offsetMinutes !== undefined) {
    const absMinutes = Math.abs(offsetMinutes);
    if (absMinutes === 0) {
      label = "At due time";
    } else if (absMinutes < 60) {
      label = `${absMinutes}m before`;
    } else if (absMinutes < 1440) {
      label = `${Math.round(absMinutes / 60)}h before`;
    } else {
      label = `${Math.round(absMinutes / 1440)}d before`;
    }
  } else if (fireAt) {
    const date = new Date(fireAt);
    label = date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full">
      {/* Bell icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-3 h-3"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
        />
      </svg>
      {label}
    </span>
  );
}
