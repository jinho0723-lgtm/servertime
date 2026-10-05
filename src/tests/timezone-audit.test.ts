import { describe, it, expect } from "vitest";
import { formatKstDateTime, formatKstTime, formatKstTimeWithSec } from "../lib/utils";

describe("Timezone Audit: DB/ISO UTC vs UI Asia/Seoul", () => {
  it("Correctly converts UTC ISO string to Asia/Seoul (+09:00) with zero drift", () => {
    // 2026-10-02T10:00:00.000Z in UTC is 2026-10-02 19:00:00 in KST
    const utcIso = "2026-10-02T10:00:00.000Z";
    const kstTime = formatKstTime(utcIso);
    expect(kstTime).toBe("19:00");

    const kstDateTime = formatKstDateTime(utcIso);
    expect(kstDateTime).toContain("2026. 10. 02.");
    expect(kstDateTime).toContain("19:00:00");

    // 2026-10-02T18:59:03.124Z in UTC is next day 03:59:03 in KST
    const lateUtcIso = "2026-10-02T18:59:03.124Z";
    const lateKstTime = formatKstTimeWithSec(lateUtcIso);
    expect(lateKstTime).toBe("03:59:03");
  });

  it("Ticket Open KST 14:00 converts to UTC 05:00:00.000Z in storage", () => {
    const kstIso = "2026-10-05T14:00:00+09:00";
    const date = new Date(kstIso);
    const utcString = date.toISOString();
    expect(utcString).toBe("2026-10-05T05:00:00.000Z");

    // UI formats it back to KST 14:00
    expect(formatKstTime(utcString)).toBe("14:00");
  });
});
