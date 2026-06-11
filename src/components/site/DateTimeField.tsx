import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));

export function DateTimeField({
  dateLabel,
  timeLabel,
  required,
  date,
  setDate,
  time,
  setTime,
  minDate,
  allowPast,
}: {
  dateLabel: string;
  timeLabel: string;
  required?: boolean;
  date?: Date;
  setDate: (d?: Date) => void;
  time: string;
  setTime: (v: string) => void;
  minDate?: Date;
  allowPast?: boolean;
}) {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const floor = allowPast
    ? (minDate ? new Date(new Date(minDate).setHours(0, 0, 0, 0)) : new Date(-8640000000000000))
    : (minDate && minDate > today ? new Date(new Date(minDate).setHours(0, 0, 0, 0)) : today);
  const minStr = allowPast && !minDate ? undefined : format(floor, "yyyy-MM-dd");
  const dateStr = date ? format(date, "yyyy-MM-dd") : "";
  const [hh = "08", mm = "00"] = time.split(":");

  return (
    <div className="space-y-1.5">
      <div className="space-y-2">
        <Label>
          {dateLabel} {required && <span className="text-destructive">*</span>}
        </Label>
        <div className="relative">
          <input
            type="date"
            value={dateStr}
            min={minStr}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) {
                setDate(undefined);
                return;
              }
              const parsed = parse(v, "yyyy-MM-dd", new Date());
              if (!isNaN(parsed.getTime()) && parsed >= floor) setDate(parsed);
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Otvori kalendar"
                className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <CalendarIcon className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                disabled={(d) => d < floor}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Label>{timeLabel}</Label>
        <div className="flex items-center gap-2">
          <Select value={hh} onValueChange={(v) => setTime(`${v}:${mm}`)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {HOURS.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">:</span>
          <Select value={MINUTES.includes(mm) ? mm : "00"} onValueChange={(v) => setTime(`${hh}:${v}`)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {MINUTES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
