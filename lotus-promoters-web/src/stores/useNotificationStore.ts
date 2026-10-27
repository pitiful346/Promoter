import { create } from "zustand";
import { SystemNotificationLog, NotificationType } from "@/core/domain/notification";

interface NotificationStoreState {
  logs: SystemNotificationLog[];
  addLog: (log: Omit<SystemNotificationLog, "id" | "created_at">) => SystemNotificationLog;
  getLogsByOrg: (orgId: string) => SystemNotificationLog[];
  simulateTriggerNotification: (
    orgId: string,
    type: NotificationType,
    title: string,
    body: string,
    target: "event" | "teaser",
    targetId: string,
    recipientsCount: number
  ) => SystemNotificationLog;
}

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  logs: [],


  addLog: (data) => {
    const newLog: SystemNotificationLog = {
      ...data,
      id: `notif_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    set((state) => ({ logs: [newLog, ...state.logs] }));
    return newLog;
  },

  getLogsByOrg: (orgId) => {
    return get().logs.filter((l) => l.organization_id === orgId);
  },

  simulateTriggerNotification: (
    orgId,
    type,
    title,
    body,
    target,
    targetId,
    recipientsCount
  ) => {
    const deliveredCount = Math.round(recipientsCount * 0.98);
    const openCount = Math.round(recipientsCount * 0.38);

    const newLog: SystemNotificationLog = {
      id: `notif_${Date.now()}`,
      organization_id: orgId,
      type,
      category:
        type === "PROMOTER_NEW_EVENT"
          ? "FOLLOWED_PROMOTERS"
          : type === "RADAR_TEASER_REVEALED" || type === "RADAR_REVEAL_APPROACHING"
          ? "RADAR_REVEALS"
          : "SAVED_EVENTS",
      title,
      body,
      deep_link: {
        scheme: "lotus://",
        target,
        target_id: targetId,
        url: `lotus://${target}/${targetId}`,
      },
      recipients_count: recipientsCount,
      delivered_count: deliveredCount,
      open_count: openCount,
      status: "SENT",
      trigger_event_id: target === "event" ? targetId : undefined,
      trigger_teaser_id: target === "teaser" ? targetId : undefined,
      created_at: new Date().toISOString(),
    };

    set((state) => ({ logs: [newLog, ...state.logs] }));
    return newLog;
  },
}));
