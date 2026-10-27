import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  setDoc,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { INotificationRepository } from "@/core/application/repositories";
import {
  SystemNotificationLog,
  DeviceToken,
  UserNotificationPreferences,
} from "@/core/domain/notification";

export class FirestoreNotificationRepository implements INotificationRepository {
  private logsCollection = "system_notifications";
  private tokensCollection = "user_device_tokens";
  private prefsCollection = "user_notification_preferences";

  private mapDocToLog(id: string, data: DocumentData): SystemNotificationLog {
    const parseDate = (val: unknown): string => {
      if (!val) return new Date().toISOString();
      if (val instanceof Timestamp) return val.toDate().toISOString();
      if (typeof (val as { toDate?: () => Date })?.toDate === "function") return (val as { toDate: () => Date }).toDate().toISOString();
      if (typeof val === "string") return val;
      return new Date().toISOString();
    };


    return {
      id,
      organization_id: data.organization_id || "org_1",
      type: data.type || "PROMOTER_NEW_EVENT",
      category: data.category || "FOLLOWED_PROMOTERS",
      title: data.title || "",
      body: data.body || "",
      deep_link: data.deep_link || {
        scheme: "lotus://",
        target: "event",
        target_id: "event_1",
        url: "lotus://event/event_1",
      },
      recipients_count: typeof data.recipients_count === "number" ? data.recipients_count : 0,
      delivered_count: typeof data.delivered_count === "number" ? data.delivered_count : 0,
      open_count: typeof data.open_count === "number" ? data.open_count : 0,
      status: data.status || "SENT",
      trigger_event_id: data.trigger_event_id || undefined,
      trigger_teaser_id: data.trigger_teaser_id || undefined,
      created_at: parseDate(data.created_at),
    };
  }

  async getOrgNotificationLogs(orgId: string): Promise<SystemNotificationLog[]> {
    try {
      const q = query(
        collection(db, this.logsCollection),
        where("organization_id", "==", orgId)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => this.mapDocToLog(d.id, d.data()));
    } catch {
      return [];
    }
  }

  async logSystemNotification(
    log: Omit<SystemNotificationLog, "id" | "created_at">
  ): Promise<SystemNotificationLog> {
    const now = Timestamp.now();
    const payload = {
      ...log,
      created_at: now,
    };
    const docRef = await addDoc(collection(db, this.logsCollection), payload);
    return {
      ...log,
      id: docRef.id,
      created_at: new Date().toISOString(),
    };
  }

  async registerDeviceToken(token: DeviceToken): Promise<void> {
    const docRef = doc(db, this.tokensCollection, token.id || `${token.user_id}_${token.platform}`);
    await setDoc(docRef, {
      ...token,
      last_used_at: Timestamp.now(),
    });
  }

  async getUserPreferences(userId: string): Promise<UserNotificationPreferences | null> {
    const snap = await getDoc(doc(db, this.prefsCollection, userId));
    if (!snap.exists()) return null;
    return snap.data() as UserNotificationPreferences;
  }

  async updateUserPreferences(
    userId: string,
    prefs: Partial<UserNotificationPreferences>
  ): Promise<void> {
    const docRef = doc(db, this.prefsCollection, userId);
    await setDoc(docRef, prefs, { merge: true });
  }
}

export const firestoreNotificationRepository = new FirestoreNotificationRepository();
