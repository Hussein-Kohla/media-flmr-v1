import * as React from "react";
import { cn } from "@/lib/utils";

type SelectProps = {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
};

export const SelectValue = ({ value }: { value: string }) => {
  return <span className="text-muted-foreground">{value || "Select an option"}</span>;
};

export const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => {
  return (
    <div className="px-2 py-1.5 text-sm hover:bg-accent cursor-pointer rounded-sm" data-value={value}>
      {children}
    </div>
  );
};

export const SelectContent = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <div className={cn("absolute left-0 top-full z-[999] mt-1 w-full rounded-md border bg-[#121217] p-1 shadow-md border-white/10", className)}>
      {children}
    </div>
  );
};

export const SelectTrigger = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <div className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
      {children}
    </div>
  );
};

export const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;
        if (child.type === SelectTrigger) {
          return React.cloneElement(child as any, {
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              setOpen((current) => !current);
            },
            role: "button",
            tabIndex: 0,
          });
        }
        if (child.type === SelectContent) {
          return open
            ? React.cloneElement(child as any, {
                className: cn("fixed z-[9999]", child.props.className),
                 onClick: (e: React.MouseEvent) => {
                  e.stopPropagation();
                  const target = e.target?.closest?.("[data-value]");
                  const selectedValue = target?.getAttribute?.("data-value");
                  if (selectedValue) {
                    onValueChange(selectedValue);
                    setOpen(false);
                  }
                },
              })
            : null;
        }
        return null;
      })}
    </div>
  );
};
