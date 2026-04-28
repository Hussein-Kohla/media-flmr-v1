"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Language = "en" | "ar";

interface AppContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  formatDate: (date: number | string | Date) => string;
  formatDateTime: (date: number | string | Date) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    dashboard_title: "COMMAND CENTER",
    calendar: "Calendar",
    clients: "Clients",
    editing: "Editing",
    publishing: "Publishing",
    settings: "Settings",
    pipeline: "Agency Pipeline",
    main_menu: "Main Navigation",
    dark_mode: "Dark Mode",
    unsaved_changes: "You have unsaved changes",
    discard: "Discard",
    save_changes: "Save Changes",
    configuration: "Configuration",
    agency_name: "Agency Name",
    agency_name_hint: "This name will be visible on all client-facing documents.",
    task_meeting: "Meeting",
    task_deadline: "Deadline",
    task_reminder: "Reminder",
    task_shoot: "Shoot",
    task_other: "Other",
    total_revenue: "Total Revenue",
    active_clients: "Active Clients",
    completed_projects: "Projects Done",
    pending_edits: "Pending Edits",
    weekly_activity: "Weekly Activity",
    recent_work: "Recent Work",
    view_all: "View All",
    january: "January", february: "February", march: "March", april: "April", may: "May", june: "June",
    july: "July", august: "August", september: "September", october: "October", november: "November", december: "December",
    client: "Client",
    video_card_details: "Video Details",
    linked_video: "Linked Video",
    platform: "Platform",
    task_title: "Task Title",
    publish_date: "Publish Date",
    status: "Status",
    caption_placeholder: "Caption Placeholder",
    not_ready: "Not Ready",
    ready: "Ready",
    published: "Published",
    pending: "Pending",
    in_progress: "In Progress",
    done: "Done",
    no_video: "No Video",
    no_project: "No Project",
    select_client_first: "Select Client First",
    save_post: "Save Post",
    create_post: "Create Post",
    new_post: "New Post",
    none: "None",
    no_videos_for_this_client: "No videos found for the selected client",
    unknown_client: "Unknown Client",
  },
  ar: {
    dashboard: "لوحة التحكم",
    dashboard_title: "مركز القيادة",
    calendar: "التقويم",
    clients: "العملاء",
    editing: "المونتاج",
    publishing: "النشر",
    settings: "الإعدادات",
    pipeline: "مسار العمل",
    main_menu: "القائمة الرئيسية",
    dark_mode: "الوضع الليلي",
    unsaved_changes: "لديك تغييرات غير محفوظة",
    discard: "تجاهل",
    save_changes: "حفظ التغييرات",
    configuration: "الإعدادات العامة",
    agency_name: "اسم الوكالة",
    agency_name_hint: "هذا الاسم سيظهر في كل المستندات ولوحات التحكم الخاصة بالعملاء.",
    task_meeting: "اجتماع",
    task_deadline: "موعد نهائي",
    task_reminder: "تذكير",
    task_shoot: "تصوير",
    task_other: "أخرى",
    total_revenue: "إجمالي الأرباح",
    active_clients: "العملاء النشطون",
    completed_projects: "المشاريع المنتهية",
    pending_edits: "فيديوهات قيد المونتاج",
    weekly_activity: "النشاط الأسبوعي",
    recent_work: "آخر الأعمال",
    view_all: "عرض الكل",
    january: "يناير", february: "فبراير", march: "مارس", april: "أبريل", may: "مايو", june: "يونيو",
    july: "يوليو", august: "أغسطس", september: "سبتمبر", october: "أكتوبر", november: "نوفمبر", december: "ديسمبر",
    client: "العميل",
    video_card_details: "تفاصيل الفيديو",
    linked_video: "الفيديو المرتبط",
    platform: "المنصة",
    task_title: "عنوان المهمة",
    publish_date: "تاريخ النشر",
    status: "الحالة",
    caption_placeholder: "محتوى المنشور (كابشن)",
    not_ready: "غير جاهز",
    ready: "جاهز",
    published: "تم النشر",
    pending: "قيد الانتظار",
    in_progress: "جاري العمل",
    done: "منتهي",
    no_video: "لا يوجد فيديو",
    no_project: "لا يوجد مشروع",
    select_client_first: "اختر العميل أولاً",
    save_post: "حفظ المنشور",
    create_post: "إنشاء منشور",
    new_post: "منشور جديد",
    none: "لا شيء",
    no_videos_for_this_client: "لا توجد فيديوهات مسجلة لهذا العميل",
    unknown_client: "عميل غير معروف",
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Load from localStorage if available
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedLang = localStorage.getItem("language") as Language;
    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLanguage(savedLang);
    
    // Apply theme to document
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ar" : "en";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <AppContext.Provider value={{ 
      theme, 
      language, 
      toggleTheme, 
      toggleLanguage, 
      t,
      formatDate: (date: number | string | Date) => {
        try {
          const d = new Date(date);
          if (isNaN(d.getTime())) return String(date);
          return d.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        } catch (e) {
          return String(date);
        }
      },
      formatDateTime: (date: number | string | Date) => {
        try {
          const d = new Date(date);
          if (isNaN(d.getTime())) return String(date);
          return d.toLocaleString(language === "ar" ? "ar-EG" : "en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch (e) {
          return String(date);
        }
      }
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
