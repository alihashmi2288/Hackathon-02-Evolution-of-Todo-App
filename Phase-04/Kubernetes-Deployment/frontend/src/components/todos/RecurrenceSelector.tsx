"use client";

/**
 * Recurrence selector component for recurring todos.
 *
 * Task Reference: T042 [US1] - Create RecurrenceSelector component
 * Task Reference: T083 [US5] - Add "Custom" frequency option
 * Task Reference: T084 [US5] - Create interval input (already implemented)
 * Task Reference: T085 [US5] - Create weekday multi-select (already implemented)
 * Task Reference: T086 [US5] - Create day-of-month selector for monthly
 * Feature: 006-recurring-reminders
 *
 * Allows users to set recurrence patterns for todos including custom patterns.
 */

import { useState, useEffect } from "react";
import type {
  RecurrenceConfig,
  RecurrenceFrequency,
  DayOfWeek,
} from "@/types/recurrence";
import { DAY_OF_WEEK_LABELS } from "@/types/recurrence";

interface RecurrenceSelectorProps {
  value: RecurrenceConfig | null;
  onChange: (value: RecurrenceConfig | null) => void;
  disabled?: boolean;
  /** Whether a due date is set (recurrence requires due date) */
  hasDueDate?: boolean;
}

/**
 * Frequency options including custom for advanced patterns.
 * T083 [US5] - Custom frequency option added.
 */
const FREQUENCY_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom" },
];

const DAYS_OF_WEEK: DayOfWeek[] = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

/**
 * Days of month options (1-31) for monthly recurrence.
 * T086 [US5] - Day-of-month selector for monthly frequency.
 */
const DAYS_OF_MONTH: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

/**
 * Component for selecting recurrence patterns.
 *
 * Task Reference: T042 [US1]
 */
export function RecurrenceSelector({
  value,
  onChange,
  disabled = false,
  hasDueDate = false,
}: RecurrenceSelectorProps) {
  const [isRecurring, setIsRecurring] = useState(value !== null);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(
    value?.frequency ?? "daily"
  );
  const [interval, setInterval] = useState(value?.interval ?? 1);
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>(
    value?.days_of_week ?? []
  );
  // T086 [US5] - Day of month for monthly frequency
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(
    value?.day_of_month ?? null
  );
  const [endType, setEndType] = useState<"never" | "count" | "date">(
    value?.end_count ? "count" : value?.end_date ? "date" : "never"
  );
  const [endCount, setEndCount] = useState(value?.end_count ?? 10);
  const [endDate, setEndDate] = useState(value?.end_date ?? "");

  // Update parent when config changes
  useEffect(() => {
    if (!isRecurring) {
      onChange(null);
      return;
    }

    const config: RecurrenceConfig = {
      frequency,
      interval,
    };

    // T085 [US5] - Add days of week for weekly frequency
    if ((frequency === "weekly" || frequency === "custom") && daysOfWeek.length > 0) {
      config.days_of_week = daysOfWeek;
    }

    // T086 [US5] - Add day of month for monthly frequency
    if ((frequency === "monthly" || frequency === "custom") && dayOfMonth !== null) {
      config.day_of_month = dayOfMonth;
    }

    if (endType === "count") {
      config.end_count = endCount;
    } else if (endType === "date" && endDate) {
      config.end_date = endDate;
    }

    onChange(config);
  }, [isRecurring, frequency, interval, daysOfWeek, dayOfMonth, endType, endCount, endDate, onChange]);

  const handleDayToggle = (day: DayOfWeek) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Show warning if no due date
  if (!hasDueDate) {
    return (
      <div className="text-sm text-gray-500 italic">
        Set a due date to enable recurrence
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toggle for recurring */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">
          Repeat this todo
        </span>
      </label>

      {isRecurring && (
        <div className="pl-6 space-y-3 border-l-2 border-blue-100">
          {/* Frequency selector - T084 [US5] */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Every</span>
              <input
                type="number"
                min={1}
                max={365}
                value={interval}
                onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={disabled}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                disabled={disabled}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value === "custom"
                      ? "custom"
                      : interval === 1
                        ? opt.label.toLowerCase().replace("ly", "")
                        : opt.label.toLowerCase().replace("ly", "s")}
                  </option>
                ))}
              </select>
            </div>
            {/* T083 [US5] - Custom frequency hint */}
            {frequency === "custom" && (
              <p className="text-xs text-gray-500">
                Combine interval with days of week and/or day of month below.
              </p>
            )}
          </div>

          {/* Days of week for weekly frequency - T085 [US5] */}
          {(frequency === "weekly" || frequency === "custom") && (
            <div className="space-y-1">
              <span className="text-sm text-gray-600">On days:</span>
              <div className="flex flex-wrap gap-1">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    disabled={disabled}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${daysOfWeek.includes(day)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } disabled:opacity-50`}
                  >
                    {DAY_OF_WEEK_LABELS[day]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day of month for monthly frequency - T086 [US5] */}
          {(frequency === "monthly" || frequency === "custom") && (
            <div className="space-y-1">
              <span className="text-sm text-gray-600">On day of month:</span>
              <div className="flex items-center gap-2">
                <select
                  value={dayOfMonth ?? ""}
                  onChange={(e) =>
                    setDayOfMonth(e.target.value ? parseInt(e.target.value, 10) : null)
                  }
                  disabled={disabled}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Any day</option>
                  {DAYS_OF_MONTH.map((day) => (
                    <option key={day} value={day}>
                      {day}
                      {day === 1 || day === 21 || day === 31
                        ? "st"
                        : day === 2 || day === 22
                          ? "nd"
                          : day === 3 || day === 23
                            ? "rd"
                            : "th"}
                    </option>
                  ))}
                </select>
                {dayOfMonth !== null && (
                  <button
                    type="button"
                    onClick={() => setDayOfMonth(null)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                    disabled={disabled}
                  >
                    Clear
                  </button>
                )}
              </div>
              {dayOfMonth && dayOfMonth > 28 && (
                <p className="text-xs text-amber-600">
                  Note: For months with fewer days, recurrence will occur on the last day.
                </p>
              )}
            </div>
          )}

          {/* End condition */}
          <div className="space-y-2">
            <span className="text-sm text-gray-600">Ends:</span>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="endType"
                  checked={endType === "never"}
                  onChange={() => setEndType("never")}
                  disabled={disabled}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Never</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="endType"
                  checked={endType === "count"}
                  onChange={() => setEndType("count")}
                  disabled={disabled}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">After</span>
                {endType === "count" && (
                  <>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={endCount}
                      onChange={(e) =>
                        setEndCount(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      disabled={disabled}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                    <span className="text-sm text-gray-700">occurrences</span>
                  </>
                )}
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="endType"
                  checked={endType === "date"}
                  onChange={() => setEndType("date")}
                  disabled={disabled}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">On date</span>
                {endType === "date" && (
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={disabled}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                )}
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
