import { prisma } from "@/lib/prisma";
import { addDaysISO } from "@/lib/utils";

const DEFAULT_TIMES = ["09:00", "10:30", "13:00", "15:00", "17:00"];

function endTimeFromStart(startTime: string, minutes = 50): string {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Süpervizörün müsaitlik kaydı yoksa önümüzdeki 21 gün için varsayılan slotlar oluşturur. */
export async function ensureDefaultAvailabilitySlots(supervisorId: string): Promise<void> {
  const count = await prisma.availabilitySlot.count({ where: { supervisorId } });
  if (count > 0) return;

  const data: {
    supervisorId: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
  }[] = [];

  for (let day = 1; day <= 21; day++) {
    const date = addDaysISO(day);
    const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
    if (dayOfWeek === 0) continue;

    for (const startTime of DEFAULT_TIMES) {
      data.push({
        supervisorId,
        date,
        startTime,
        endTime: endTimeFromStart(startTime),
        isBooked: false,
      });
    }
  }

  if (data.length > 0) {
    await prisma.availabilitySlot.createMany({ data });
  }
}
