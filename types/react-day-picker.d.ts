// Type declaration stub for react-day-picker
// Install the package with: npm install react-day-picker
declare module "react-day-picker" {
  import * as React from "react";

  export interface Locale {
    code?: string;
    [key: string]: unknown;
  }

  export interface DayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    day: { date: Date };
    modifiers: {
      selected?: boolean;
      focused?: boolean;
      range_start?: boolean;
      range_end?: boolean;
      range_middle?: boolean;
      today?: boolean;
      outside?: boolean;
      disabled?: boolean;
      hidden?: boolean;
      [key: string]: boolean | undefined;
    };
  }

  export type DayButton = React.ComponentType<DayButtonProps>;

  export interface DayPickerProps {
    showOutsideDays?: boolean;
    captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
    locale?: Partial<Locale>;
    formatters?: Record<string, (date: Date, options?: { locale?: Partial<Locale> }) => string>;
    classNames?: Record<string, string>;
    components?: Record<string, React.ComponentType<unknown>>;
    showWeekNumber?: boolean;
    mode?: "single" | "multiple" | "range" | "default";
    selected?: Date | Date[] | { from?: Date; to?: Date };
    onSelect?: (date: unknown) => void;
    defaultMonth?: Date;
    month?: Date;
    onMonthChange?: (month: Date) => void;
    numberOfMonths?: number;
    fromDate?: Date;
    toDate?: Date;
    fromYear?: number;
    toYear?: number;
    disabled?: unknown;
    className?: string;
    style?: React.CSSProperties;
    [key: string]: unknown;
  }

  export function DayPicker(props: DayPickerProps): React.ReactElement;
  export function getDefaultClassNames(): Record<string, string>;
}
