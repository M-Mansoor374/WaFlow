import type { Message } from "@/types/message";

interface LocationMessageProps {
  message: Message;
}

export function LocationMessage({ message }: LocationMessageProps) {
  const loc = message.location;
  if (!loc) return null;

  const lat = loc.latitude;
  const lon = loc.longitude;
  const n = 1 << 15;
  const latRad = (lat * Math.PI) / 180;
  const x = Math.floor(((lon + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  const tileUrl = `https://tile.openstreetmap.org/15/${x}/${y}.png`;

  return (
    <div className="flex flex-col gap-1">
      <img
        src={tileUrl}
        alt="Map"
        className="max-w-[280px] rounded-lg border border-border"
      />
      {(loc.name || loc.address) && (
        <div className="text-sm">
          {loc.name && <p className="font-medium">{loc.name}</p>}
          {loc.address && <p className="text-muted-foreground">{loc.address}</p>}
        </div>
      )}
    </div>
  );
}
