import { describe, it, expect } from "vitest";
import { isWithinKstToday, isWithin24Hours } from "../lib/utils";
import { KOREAN_UNIVERSITIES } from "../lib/university-data";

describe("Today 24h Filtering & University Directory Test Suite", () => {
  it("correctly identifies events within today's KST date vs future dates", () => {
    // Reference date: 2026-10-02 12:00:00 KST
    const refDate = new Date("2026-10-02T03:00:00.000Z"); // 12:00 KST

    // Today in KST: 2026-10-02 20:00 KST -> 11:00 UTC
    const todayEventIso = "2026-10-02T11:00:00.000Z";
    expect(isWithinKstToday(todayEventIso, refDate)).toBe(true);

    // Tomorrow in KST: 2026-10-03 10:00 KST -> 01:00 UTC
    const tomorrowEventIso = "2026-10-03T01:00:00.000Z";
    expect(isWithinKstToday(tomorrowEventIso, refDate)).toBe(false);

    // 4 days later in KST: 2026-10-06 14:00 KST
    const futureEventIso = "2026-10-06T05:00:00.000Z";
    expect(isWithinKstToday(futureEventIso, refDate)).toBe(false);
  });

  it("contains all major Korean university course registration domains", () => {
    expect(KOREAN_UNIVERSITIES.length).toBeGreaterThanOrEqual(50);

    const snu = KOREAN_UNIVERSITIES.find((u) => u.id === "snu");
    expect(snu?.domain).toBe("sugang.snu.ac.kr");
    expect(snu?.name).toBe("서울대학교");

    const korea = KOREAN_UNIVERSITIES.find((u) => u.id === "korea");
    expect(korea?.domain).toBe("sugang.korea.ac.kr");

    const yonsei = KOREAN_UNIVERSITIES.find((u) => u.id === "yonsei");
    expect(yonsei?.domain).toBe("portal.yonsei.ac.kr");

    const kaist = KOREAN_UNIVERSITIES.find((u) => u.id === "kaist");
    expect(kaist?.domain).toBe("portal.kaist.ac.kr");

    const pnu = KOREAN_UNIVERSITIES.find((u) => u.id === "pnu");
    expect(pnu?.domain).toBe("sugang.pusan.ac.kr");

    // All universities must have non-empty required properties
    for (const univ of KOREAN_UNIVERSITIES) {
      expect(univ.id).toBeTruthy();
      expect(univ.name).toBeTruthy();
      expect(univ.shortName).toBeTruthy();
      const isValidDomain = univ.domain.includes(".ac.kr") || univ.domain.includes(".edu");
      expect(isValidDomain).toBe(true);
      expect(["서울", "수도권", "지방거점", "특성화"]).toContain(univ.region);
    }
  });
});
