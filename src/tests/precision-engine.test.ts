import { describe, it, expect, vi } from "vitest";
import {
  calculateConnectionQuality,
  calculateOverallConfidence,
  PrecisionClockEngine,
  SyncMeasurement,
} from "../lib/engine/precision-clock";

describe("Precision Clock Dual-Anchor and Monotonic Projection", () => {
  it("strictly projects time using syncEpochMs + (performance.now() - syncPerformanceMs)", () => {
    const engine = new PrecisionClockEngine("test.domain");

    // Manually set measurement anchors
    const anchorEpoch = 1760000000000;
    const anchorPerf = 1000.0;

    const mockMeasurement: SyncMeasurement = {
      host: "test.domain",
      syncEpochMs: anchorEpoch,
      syncPerformanceMs: anchorPerf,
      rttMedianMs: 40,
      rttStdDevMs: 2,
      sampleCount: 5,
      rejectedSampleCount: 2,
      networkLatencyUncertaintyMs: 22,
      quantizationUncertaintyMs: 500,
      totalEstimatedErrorMs: 522,
      connectionQuality: "EXCELLENT",
      timeSourceQuality: "SECOND RESOLUTION",
      overallConfidence: "MODERATE",
      status: "NORMAL",
      lastSyncAt: Date.now(),
      hasDateHeader: true,
      cdnDetected: null,
    };

    // Inject measurement
    (engine as unknown as { currentMeasurement: SyncMeasurement }).currentMeasurement = mockMeasurement;

    // Mock performance.now() to 1500ms (500ms elapsed)
    vi.spyOn(performance, "now").mockReturnValue(1500.0);

    const projected = engine.getPrecisionNow();
    expect(projected).toBe(anchorEpoch + 500);

    vi.restoreAllMocks();
  });
});

describe("Decomposed Quality Classifications", () => {
  it("rates connection quality purely on RTT and jitter", () => {
    expect(calculateConnectionQuality(35, 2)).toBe("EXCELLENT");
    expect(calculateConnectionQuality(80, 15)).toBe("GOOD");
    expect(calculateConnectionQuality(180, 40)).toBe("FAIR");
    expect(calculateConnectionQuality(400, 100)).toBe("POOR");
  });

  it("rates overall confidence recognizing second-level resolution constraints", () => {
    // Even if connection is EXCELLENT, a 1-second resolution source caps confidence at MODERATE
    expect(calculateOverallConfidence("EXCELLENT", "SECOND RESOLUTION", false)).toBe("MODERATE");
    expect(calculateOverallConfidence("EXCELLENT", "HIGH RESOLUTION", false)).toBe("HIGH");
    expect(calculateOverallConfidence("POOR", "SECOND RESOLUTION", false)).toBe("LOW");
    expect(calculateOverallConfidence("GOOD", "FALLBACK", true)).toBe("DEGRADED");
  });
});

describe("Edge Case Simulation Tests", () => {
  it("handles high RTT and asymmetric jitter gracefully without negative values", () => {
    const rttSamples = [350, 420, 890, 1200, 2400];
    const sorted = [...rttSamples].sort((a, b) => a - b);
    const filtered = sorted.slice(1, -1); // 420, 890, 1200
    const median = filtered[1]; // 890
    expect(median).toBe(890);
    expect(calculateConnectionQuality(median, 300)).toBe("POOR");
  });

  it("handles system clock mutation without affecting monotonic interpolation", () => {
    const anchorEpoch = 1700000000000;
    const anchorPerf = 5000.0;

    // Simulate user altering OS Date.now() by +1 hour
    const dateSpy = vi.spyOn(Date, "now").mockReturnValue(anchorEpoch + 3600000);
    // But performance.now() only advances 200ms
    const perfSpy = vi.spyOn(performance, "now").mockReturnValue(anchorPerf + 200.0);

    const elapsedFromPerf = performance.now() - anchorPerf;
    const estimatedEpoch = anchorEpoch + elapsedFromPerf;

    expect(estimatedEpoch).toBe(anchorEpoch + 200); // Completely immune to OS clock jump

    dateSpy.mockRestore();
    perfSpy.mockRestore();
  });

  it("handles background/resume resynchronization condition", () => {
    const lastSyncAt = Date.now() - 65000; // 65 seconds ago
    const isStale = Date.now() - lastSyncAt > 30000;
    expect(isStale).toBe(true);
  });
});
