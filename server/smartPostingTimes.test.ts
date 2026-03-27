import { describe, it, expect } from "vitest";
import {
  getNextSmartPostingTime,
  getNextSmartPostingTimes,
  getWeeklySchedule,
  getAllSchedules,
  getBestTimeForDay,
} from "./smartPostingTimes";

describe("Smart Posting Times Engine", () => {
  describe("getNextSmartPostingTime", () => {
    it("should return a valid result for instagram", () => {
      const result = getNextSmartPostingTime("instagram");
      expect(result).toBeDefined();
      expect(result.platform).toBe("instagram");
      expect(result.hour).toBeGreaterThanOrEqual(0);
      expect(result.hour).toBeLessThanOrEqual(23);
      expect(result.minute).toBeGreaterThanOrEqual(0);
      expect(result.minute).toBeLessThanOrEqual(59);
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.scheduledTime).toBeTruthy();
      expect(result.dayName).toBeTruthy();
      expect(result.reason).toBeTruthy();
      expect(typeof result.isToday).toBe("boolean");
    });

    it("should return a valid result for tiktok", () => {
      const result = getNextSmartPostingTime("tiktok");
      expect(result.platform).toBe("tiktok");
      expect(result.score).toBeGreaterThan(0);
    });

    it("should return a valid result for linkedin", () => {
      const result = getNextSmartPostingTime("linkedin");
      expect(result.platform).toBe("linkedin");
      expect(result.score).toBeGreaterThan(0);
    });

    it("should return a valid result for facebook", () => {
      const result = getNextSmartPostingTime("facebook");
      expect(result.platform).toBe("facebook");
    });

    it("should return a valid result for twitter", () => {
      const result = getNextSmartPostingTime("twitter");
      expect(result.platform).toBe("twitter");
    });

    it("should return a valid result for youtube", () => {
      const result = getNextSmartPostingTime("youtube");
      expect(result.platform).toBe("youtube");
    });

    it("should return a valid result for threads", () => {
      const result = getNextSmartPostingTime("threads");
      expect(result.platform).toBe("threads");
    });

    it("should return a valid result for pinterest", () => {
      const result = getNextSmartPostingTime("pinterest");
      expect(result.platform).toBe("pinterest");
    });

    it("should handle unknown platforms with fallback", () => {
      const result = getNextSmartPostingTime("snapchat");
      expect(result.platform).toBe("snapchat");
      expect(result.score).toBeGreaterThan(0);
    });

    it("should return a future time", () => {
      const result = getNextSmartPostingTime("instagram");
      const scheduledDate = new Date(result.scheduledTime);
      // Should be in the future (within next 7 days)
      expect(scheduledDate.getTime()).toBeGreaterThan(Date.now() - 60000); // allow 1 min tolerance
    });

    it("should return a valid ISO date string", () => {
      const result = getNextSmartPostingTime("instagram");
      expect(() => new Date(result.scheduledTime)).not.toThrow();
      const d = new Date(result.scheduledTime);
      expect(d.getTime()).not.toBeNaN();
    });
  });

  describe("getNextSmartPostingTimes", () => {
    it("should return results for multiple platforms", () => {
      const results = getNextSmartPostingTimes(["instagram", "tiktok", "facebook"]);
      expect(results).toHaveLength(3);
      expect(results[0].platform).toBe("instagram");
      expect(results[1].platform).toBe("tiktok");
      expect(results[2].platform).toBe("facebook");
    });

    it("should return empty array for empty input", () => {
      const results = getNextSmartPostingTimes([]);
      expect(results).toHaveLength(0);
    });

    it("should handle all 8 platforms", () => {
      const platforms = ["instagram", "tiktok", "facebook", "linkedin", "twitter", "threads", "youtube", "pinterest"];
      const results = getNextSmartPostingTimes(platforms);
      expect(results).toHaveLength(8);
      results.forEach((r: any) => {
        expect(r.score).toBeGreaterThan(0);
        expect(r.scheduledTime).toBeTruthy();
      });
    });
  });

  describe("getWeeklySchedule", () => {
    it("should return a full weekly schedule for instagram", () => {
      const schedule = getWeeklySchedule("instagram");
      expect(schedule.platform).toBe("instagram");
      expect(schedule.displayName).toBeTruthy();
      expect(schedule.emoji).toBeTruthy();
      expect(schedule.weekSchedule).toHaveLength(7);
      expect(schedule.globalBestTimes).toBeDefined();
      expect(schedule.globalBestTimes.length).toBeGreaterThan(0);
      expect(schedule.peakDays).toBeDefined();
      expect(schedule.peakDays.length).toBeGreaterThan(0);
      expect(schedule.avoidTimes).toBeDefined();
      expect(schedule.algorithmNotes).toBeTruthy();
    });

    it("should have valid day entries", () => {
      const schedule = getWeeklySchedule("tiktok");
      schedule.weekSchedule.forEach((day: any) => {
        expect(day.dayOfWeek).toBeGreaterThanOrEqual(0);
        expect(day.dayOfWeek).toBeLessThanOrEqual(6);
        expect(day.dayName).toBeTruthy();
        expect(day.slots).toBeDefined();
        expect(day.slots.length).toBeGreaterThan(0);
        expect(day.bestSlot).toBeDefined();
        expect(day.bestSlot.hour).toBeGreaterThanOrEqual(0);
        expect(day.bestSlot.hour).toBeLessThanOrEqual(23);
        expect(typeof day.isTopDay).toBe("boolean");
      });
    });

    it("should have at least one top day", () => {
      const schedule = getWeeklySchedule("instagram");
      const topDays = schedule.weekSchedule.filter((d: any) => d.isTopDay);
      expect(topDays.length).toBeGreaterThan(0);
    });

    it("should sort global best times by score descending", () => {
      const schedule = getWeeklySchedule("facebook");
      for (let i = 1; i < schedule.globalBestTimes.length; i++) {
        expect(schedule.globalBestTimes[i - 1].score).toBeGreaterThanOrEqual(schedule.globalBestTimes[i].score);
      }
    });
  });

  describe("getAllSchedules", () => {
    it("should return schedules for all 8 platforms", () => {
      const schedules = getAllSchedules();
      expect(schedules.length).toBe(8);
      const platforms = schedules.map((s: any) => s.platform);
      expect(platforms).toContain("instagram");
      expect(platforms).toContain("tiktok");
      expect(platforms).toContain("facebook");
      expect(platforms).toContain("linkedin");
      expect(platforms).toContain("twitter");
      expect(platforms).toContain("threads");
      expect(platforms).toContain("youtube");
      expect(platforms).toContain("pinterest");
    });
  });

  describe("getBestTimeForDay", () => {
    it("should return best time for Monday instagram", () => {
      const result = getBestTimeForDay("instagram", 1); // Monday
      expect(result.platform).toBe("instagram");
      expect(result.dayOfWeek).toBe(1);
      expect(result.dayName).toBe("Montag");
      expect(result.bestSlot).toBeDefined();
      expect(result.allSlots.length).toBeGreaterThan(0);
    });

    it("should return best time for Sunday", () => {
      const result = getBestTimeForDay("tiktok", 0); // Sunday
      expect(result.dayOfWeek).toBe(0);
      expect(result.dayName).toBe("Sonntag");
    });

    it("should return best time for Saturday", () => {
      const result = getBestTimeForDay("youtube", 6); // Saturday
      expect(result.dayOfWeek).toBe(6);
      expect(result.dayName).toBe("Samstag");
    });

    it("should work for all days of the week", () => {
      for (let day = 0; day <= 6; day++) {
        const result = getBestTimeForDay("instagram", day);
        expect(result.dayOfWeek).toBe(day);
        expect(result.bestSlot.score).toBeGreaterThan(0);
      }
    });
  });
});
