"use client";

import { useCallback, useEffect, useState } from "react";
import { panelFetch, panelErrorMessage } from "@/lib/panel-client";
import type { Course, CourseEnrollment, User } from "@/lib/types";

export function usePanelCourses(user: User | null) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user || user.role !== "supervisor") {
      setCourses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await panelFetch(user, "/api/panel/courses");
      if (!res.ok) throw new Error(await panelErrorMessage(res, "Kurslar yüklenemedi"));
      setCourses(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kurslar yüklenemedi");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { courses, loading, error, reload };
}

export function useMyEnrollments(user: User | null) {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) {
      setEnrollments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await panelFetch(user, "/api/panel/enrollments");
      if (!res.ok) throw new Error(await panelErrorMessage(res, "Başvurular yüklenemedi"));
      setEnrollments(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Başvurular yüklenemedi");
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { enrollments, loading, error, reload };
}
