"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

type SelectProps = {
  id?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  icon?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

const LIST_ROOM = 280;

export function Select({
  id,
  value,
  options,
  onChange,
  onBlur,
  icon,
  placeholder = "বেছে নাও",
  disabled = false,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: SelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  const move = (from: number, step: 1 | -1) => {
    for (let index = from + step; index >= 0 && index < options.length; index += step) {
      if (!options[index].disabled) return index;
    }
    return from;
  };
  const first = () => move(-1, 1);
  const last = () => move(options.length, -1);

  const findTyped = (key: string, from: number) => {
    const now = Date.now();
    const text = now - typed.current.at < 600 ? typed.current.text + key : key;
    typed.current = { text, at: now };
    const query = text.toLocaleLowerCase();

    for (let offset = 1; offset <= options.length; offset += 1) {
      const index = (from + offset + options.length) % options.length;
      const option = options[index];
      if (!option.disabled && option.label.toLocaleLowerCase().startsWith(query)) {
        return index;
      }
    }
    return -1;
  };

  const openList = (start?: number) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom;
      setPlacement(below < LIST_ROOM && rect.top > below ? "top" : "bottom");
    }
    setActive(start ?? (selectedIndex >= 0 ? selectedIndex : first()));
    setOpen(true);
  };

  const close = () => setOpen(false);

  const commit = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    if (option.value !== value) onChange(option.value);
    close();
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const { key } = event;
    const printable =
      key.length === 1 && key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(key)) {
        event.preventDefault();
        openList();
      } else if (key === "Home" || key === "End") {
        event.preventDefault();
        openList(key === "Home" ? first() : last());
      } else if (printable) {
        const index = findTyped(key, selectedIndex);
        if (index >= 0) openList(index);
      }
      return;
    }

    switch (key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((current) => move(current, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((current) => move(current, -1));
        break;
      case "Home":
      case "PageUp":
        event.preventDefault();
        setActive(first());
        break;
      case "End":
      case "PageDown":
        event.preventDefault();
        setActive(last());
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(active);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        close();
        break;
      default:
        if (printable) {
          const index = findTyped(key, active);
          if (index >= 0) setActive(index);
        }
    }
  };

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          close();
          onBlur?.();
        }}
        className={cn(
          "rounded-field text-ink flex min-h-[46px] w-full cursor-pointer items-center gap-2 border-[1.5px] px-3 text-left text-[15px] font-semibold outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          open
            ? "border-primary bg-surface"
            : "bg-field border-line hover:border-line-strong focus-visible:border-primary focus-visible:bg-surface",
        )}
      >
        {icon && (
          <span className="text-primary flex flex-none items-center gap-1.5">{icon}</span>
        )}
        <span className={cn("min-w-0 flex-1 truncate", !selected && "text-ink-faint font-medium")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "text-ink-faint h-4 w-4 flex-none transition-transform duration-150",
            open && "text-primary rotate-180",
          )}
        />
      </button>

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        hidden={!open}
        onMouseDown={(event) => event.preventDefault()}
        className={cn(
          "bg-surface border-line-soft animate-pop-in absolute right-0 left-0 z-30 max-h-[264px] min-w-[180px] overflow-y-auto overscroll-contain rounded-[16px] border p-1.5 shadow-[0_10px_30px_rgba(42,40,37,0.14)] motion-reduce:animate-none",
          placement === "bottom" ? "top-full mt-1.5 origin-top" : "bottom-full mb-1.5 origin-bottom",
        )}
      >
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;

          return (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              data-index={index}
              role="option"
              aria-selected={isSelected}
              aria-disabled={option.disabled || undefined}
              onMouseEnter={() => !option.disabled && setActive(index)}
              onClick={() => commit(index)}
              className={cn(
                "flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-[11px] px-3 py-2 text-[15px] transition-colors",
                index === active && "bg-field-alt",
                isSelected ? "text-primary-dark font-semibold" : "text-ink",
                option.disabled && "cursor-not-allowed opacity-45",
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate">{option.label}</span>
                {option.hint && (
                  <span className="text-ink-muted block text-[13px] font-normal">
                    {option.hint}
                  </span>
                )}
              </span>
              <Check
                aria-hidden
                strokeWidth={2.5}
                className={cn("text-primary h-4 w-4 flex-none", !isSelected && "invisible")}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
