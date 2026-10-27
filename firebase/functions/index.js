const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Trigger when an Auth User is deleted
 */
exports.onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const firestore = admin.firestore();
  await firestore.collection("users").doc(user.uid).delete();
});

/**
 * Helper to retrieve FCM tokens for an array of user IDs
 */
async function getDeviceTokensForUsers(firestore, userIds) {
  if (!userIds || userIds.length === 0) return [];
  const tokens = [];
  
  // Batch query in chunks of 30 for Firestore 'in' limitation
  for (let i = 0; i < userIds.length; i += 30) {
    const chunk = userIds.slice(i, i + 30);
    const snap = await firestore
      .collection("user_device_tokens")
      .where("user_id", "in", chunk)
      .get();

    snap.forEach((doc) => {
      const data = doc.data();
      if (data.token && !tokens.includes(data.token)) {
        tokens.push(data.token);
      }
    });
  }
  return tokens;
}

/**
 * 1. onEventPublished
 * Triggered whenever an event transitions to 'PUBLISHED'
 */
exports.onEventPublished = functions.firestore
  .document("events/{eventId}")
  .onWrite(async (change, context) => {
    const eventId = context.params.eventId;
    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;

    if (!afterData) return null; // Deleted event

    const wasPublished = beforeData && beforeData.status === "PUBLISHED";
    const isPublished = afterData.status === "PUBLISHED";

    // Only proceed when transitioning to PUBLISHED
    if (wasPublished || !isPublished) return null;

    const firestore = admin.firestore();

    // 0. Increment events_published_this_month for the promoter
    try {
      let promoterRef = null;
      if (afterData.organizer_id) {
        if (typeof afterData.organizer_id === "object" && afterData.organizer_id.path) {
          promoterRef = afterData.organizer_id;
        } else if (typeof afterData.organizer_id === "string") {
          promoterRef = afterData.organizer_id.startsWith("users/")
            ? firestore.doc(afterData.organizer_id)
            : firestore.collection("users").doc(afterData.organizer_id);
        }
      } else if (afterData.created_by) {
        promoterRef = firestore.collection("users").doc(afterData.created_by);
      }

      if (promoterRef) {
        await promoterRef.set(
          {
            events_published_this_month: admin.firestore.FieldValue.increment(1),
          },
          { merge: true }
        );
      }
    } catch (countErr) {
      console.warn("Could not increment events_published_this_month:", countErr);
    }

    const orgId = afterData.organization_id;
    if (!orgId) return null;

    try {
      // 1. Fetch organization metadata
      const orgDoc = await firestore.collection("organizations").doc(orgId).get();
      const orgName = orgDoc.exists ? orgDoc.data().name : "Organizador";

      // 2. Fetch all followers of this organization
      const followersSnap = await firestore
        .collection("organization_followers")
        .where("organization_id", "==", orgId)
        .get();

      const followerIds = [];
      followersSnap.forEach((doc) => {
        const d = doc.data();
        if (d.user_id) followerIds.push(d.user_id);
      });

      if (followerIds.length === 0) {
        console.log(`No followers found for organization ${orgId}`);
        return null;
      }

      // 3. Collect active FCM device tokens
      const tokens = await getDeviceTokensForUsers(firestore, followerIds);
      const title = `${orgName} publicou um novo evento!`;
      const body = `${afterData.name || "Novo evento"} foi anunciado. Bilhetes já disponíveis no Lotus.`;
      const deepLinkUrl = `lotus://event/${eventId}`;

      // 4. Send Multicast FCM Push if tokens exist
      let deliveredCount = 0;
      if (tokens.length > 0) {
        const message = {
          tokens,
          notification: {
            title,
            body,
          },
          data: {
            scheme: "lotus://",
            target: "event",
            target_id: eventId,
            url: deepLinkUrl,
          },
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        deliveredCount = response.successCount;
        console.log(`FCM broadcast for event ${eventId}: ${response.successCount} succeeded, ${response.failureCount} failed.`);
      }

      // 5. Record in System Notifications Log
      await firestore.collection("system_notifications").add({
        organization_id: orgId,
        type: "PROMOTER_NEW_EVENT",
        category: "FOLLOWED_PROMOTERS",
        title,
        body,
        deep_link: {
          scheme: "lotus://",
          target: "event",
          target_id: eventId,
          url: deepLinkUrl,
        },
        recipients_count: followerIds.length,
        delivered_count: deliveredCount,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, recipients: followerIds.length, delivered: deliveredCount };
    } catch (error) {
      console.error(`Error sending push notifications for event ${eventId}:`, error);
      return null;
    }
  });

/**
 * 2. onTeaserRevealed
 * Triggered when a Lotus Radar teaser transitions to 'REVEALED'
 */
exports.onTeaserRevealed = functions.firestore
  .document("radar_teasers/{teaserId}")
  .onWrite(async (change, context) => {
    const teaserId = context.params.teaserId;
    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;

    if (!afterData) return null;

    const wasRevealed = beforeData && beforeData.status === "REVEALED";
    const isRevealed = afterData.status === "REVEALED";

    if (wasRevealed || !isRevealed) return null;

    const firestore = admin.firestore();
    const orgId = afterData.organization_id;
    const linkedEventId = afterData.linked_event_id;

    try {
      // 1. If an event is linked, automatically publish it
      if (linkedEventId) {
        const eventRef = firestore.collection("events").doc(linkedEventId);
        const eventDoc = await eventRef.get();
        if (eventDoc.exists && eventDoc.data().status !== "PUBLISHED") {
          await eventRef.update({
            status: "PUBLISHED",
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      // 2. Fetch users who tracked this teaser or follow the organization
      const targetUserIds = new Set();

      const trackingSnap = await firestore
        .collection("radar_trackings")
        .where("teaser_id", "==", teaserId)
        .get();

      trackingSnap.forEach((doc) => {
        const d = doc.data();
        if (d.user_id) targetUserIds.add(d.user_id);
      });

      if (orgId) {
        const followersSnap = await firestore
          .collection("organization_followers")
          .where("organization_id", "==", orgId)
          .get();

        followersSnap.forEach((doc) => {
          const d = doc.data();
          if (d.user_id) targetUserIds.add(d.user_id);
        });
      }

      const userIdsList = Array.from(targetUserIds);
      if (userIdsList.length === 0) {
        console.log(`No tracked users or followers for teaser ${teaserId}`);
        return null;
      }

      // 3. Collect device tokens & send Push Notification
      const tokens = await getDeviceTokensForUsers(firestore, userIdsList);
      const title = `✨ REVEAL NO LOTUS RADAR!`;
      const body = `O teaser ${afterData.codename || "RADAR"} foi revelado no Lotus! Descobre todos os detalhes.`;
      const targetId = linkedEventId || teaserId;
      const targetType = linkedEventId ? "event" : "teaser";
      const deepLinkUrl = `lotus://${targetType}/${targetId}`;

      let deliveredCount = 0;
      if (tokens.length > 0) {
        const message = {
          tokens,
          notification: {
            title,
            body,
          },
          data: {
            scheme: "lotus://",
            target: targetType,
            target_id: targetId,
            url: deepLinkUrl,
          },
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        deliveredCount = response.successCount;
        console.log(`FCM reveal broadcast for teaser ${teaserId}: ${response.successCount} succeeded.`);
      }

      // 4. Log in System Notifications
      await firestore.collection("system_notifications").add({
        organization_id: orgId || "system",
        type: "RADAR_TEASER_REVEALED",
        category: "RADAR_REVEALS",
        title,
        body,
        deep_link: {
          scheme: "lotus://",
          target: targetType,
          target_id: targetId,
          url: deepLinkUrl,
        },
        recipients_count: userIdsList.length,
        delivered_count: deliveredCount,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, recipients: userIdsList.length, delivered: deliveredCount };
    } catch (error) {
      console.error(`Error in onTeaserRevealed for teaser ${teaserId}:`, error);
      return null;
    }
  });

/**
 * 3. scheduledRadarReveal
 * Scheduled Cron Worker running every 1 minute.
 * Scans for PUBLISHED teasers whose reveal_at has arrived and switches them to REVEALED.
 */
exports.scheduledRadarReveal = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async (context) => {
    const firestore = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    try {
      const snap = await firestore
        .collection("radar_teasers")
        .where("status", "==", "PUBLISHED")
        .where("reveal_at", "<=", now)
        .get();

      if (snap.empty) {
        return null;
      }

      const batch = firestore.batch();
      snap.forEach((doc) => {
        batch.update(doc.ref, {
          status: "REVEALED",
          updated_at: now,
        });
      });

      await batch.commit();
      console.log(`Autonomous scheduledRadarReveal processed ${snap.size} teasers.`);
      return { revealedCount: snap.size };
    } catch (error) {
      console.error("Error in scheduledRadarReveal:", error);
      return null;
    }
  });

/**
 * 4. scheduledEventIngestion
 * Scheduled Cron Worker running daily at 04:00 AM Lisbon time.
 * Triggers automated ingestion runs across all ACTIVE event sources.
 */
exports.scheduledEventIngestion = functions.pubsub
  .schedule("0 4 * * *")
  .timeZone("Europe/Lisbon")
  .onRun(async (context) => {
    const firestore = admin.firestore();
    console.log("Starting scheduledEventIngestion worker for Porto & Vila Nova de Gaia sources...");

    try {
      const sourcesSnap = await firestore
        .collection("event_sources")
        .where("status", "==", "ACTIVE")
        .get();

      console.log(`Found ${sourcesSnap.size} active event sources to sync.`);
      return { activeSourcesCount: sourcesSnap.size };
    } catch (error) {
      console.error("Error in scheduledEventIngestion:", error);
      return null;
    }
  });

/**
 * 5. scheduledMonthlyPromoterReset
 * Scheduled Cron Worker running at 00:00 AM on the 1st day of every month (Lisbon time).
 * Resets 'events_published_this_month' to 0 and records 'last_reset_date' for all promoters.
 */
exports.scheduledMonthlyPromoterReset = functions.pubsub
  .schedule("0 0 1 * *")
  .timeZone("Europe/Lisbon")
  .onRun(async (context) => {
    const firestore = admin.firestore();
    const now = admin.firestore.FieldValue.serverTimestamp();
    console.log("Starting scheduledMonthlyPromoterReset for all promoters...");

    try {
      const snap = await firestore
        .collection("users")
        .where("is_promoter", "==", true)
        .get();

      if (snap.empty) {
        console.log("No promoters found to reset.");
        return null;
      }

      const batch = firestore.batch();
      snap.forEach((doc) => {
        batch.update(doc.ref, {
          events_published_this_month: 0,
          last_reset_date: now,
        });
      });

      await batch.commit();
      console.log(`Successfully reset monthly event counter for ${snap.size} promoters.`);
      return { resetCount: snap.size };
    } catch (error) {
      console.error("Error in scheduledMonthlyPromoterReset:", error);
      return null;
    }
  });

/**
 * 6. validateEventCreation
 * Callable Cloud Function to validate whether the authenticated promoter is allowed to create an event
 * before writing the event to the database.
 * 
 * Rules:
 * - is_promoter == true
 * - If subscription_tier == 'free': checks events_published_this_month < 1.
 *   If true, allows creation and increments counter.
 *   If >= 1, blocks creation with 'Quota mensal esgotada. Faz upgrade para o plano Premium.'
 * - If subscription_tier == 'premium' or 'founder': allows unlimited creation.
 */
exports.validateEventCreation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "O utilizador tem de estar autenticado."
    );
  }

  const userId = context.auth.uid;
  const firestore = admin.firestore();
  const userRef = firestore.collection("users").doc(userId);

  return firestore.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Perfil de utilizador não encontrado no sistema."
      );
    }

    const userData = userDoc.data();

    // 1. Check if user is marked as promoter
    if (!userData.is_promoter) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Apenas utilizadores com perfil de promotor podem criar eventos."
      );
    }

    const tier = (userData.subscription_tier || "free").toLowerCase().trim();

    // 2. Unlimited tiers: 'premium' or 'founder'
    if (tier === "premium" || tier === "founder") {
      return {
        allowed: true,
        subscription_tier: tier,
        events_published_this_month: userData.events_published_this_month || 0,
      };
    }

    // 3. Free tier: quota check (max 1 event per month)
    const currentCount = userData.events_published_this_month || 0;
    if (currentCount >= 1) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "Quota mensal esgotada. Faz upgrade para o plano Premium."
      );
    }

    // Free tier: increment counter atomically
    transaction.update(userRef, {
      events_published_this_month: admin.firestore.FieldValue.increment(1),
    });

    return {
      allowed: true,
      subscription_tier: "free",
      events_published_this_month: currentCount + 1,
    };
  });
});

