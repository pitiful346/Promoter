import '/backend/schema/users_record.dart';

/// Helper class encapsulating promoter subscription tier and quota logic
/// for the Organizer Dashboard UI.
class PromoterDashboardStatus {
  final String tier;
  final int eventsPublishedThisMonth;
  final bool isPromoter;

  const PromoterDashboardStatus({
    required this.tier,
    required this.eventsPublishedThisMonth,
    required this.isPromoter,
  });

  factory PromoterDashboardStatus.fromUser(UsersRecord? user) {
    final rawTier = (user != null && user.subscriptionTier.isNotEmpty)
        ? user.subscriptionTier.toLowerCase().trim()
        : 'free';
    final events = user?.eventsPublishedThisMonth ?? 0;
    final promoter = user?.isPromoter ?? true; // Default true in organizer dashboard context

    return PromoterDashboardStatus(
      tier: rawTier,
      eventsPublishedThisMonth: events,
      isPromoter: promoter,
    );
  }

  /// Whether the promoter has unlimited event creation privileges.
  bool get isUnlimited => tier == 'premium' || tier == 'founder';

  /// Whether the promoter is on the free tier.
  bool get isFree => !isUnlimited;

  /// Clamped count of events published this month (0 or 1 for display).
  int get displayCurrentEvents {
    if (eventsPublishedThisMonth >= 1) return 1;
    if (eventsPublishedThisMonth <= 0) return 0;
    return eventsPublishedThisMonth;
  }

  /// Progress bar ratio between 0.0 and 1.0.
  double get progressRatio => isUnlimited ? 1.0 : (eventsPublishedThisMonth >= 1 ? 1.0 : 0.0);

  /// Whether the free tier monthly quota of 1 event has been exhausted.
  bool get isQuotaExhausted => !isUnlimited && eventsPublishedThisMonth >= 1;

  /// Whether the promoter can currently create a new event.
  bool get canCreateEvent => isPromoter && !isQuotaExhausted;

  /// Formatted quota text as requested: "0/1 eventos este mês" or "1/1 eventos este mês".
  String get quotaDisplayText => '$displayCurrentEvents/1 eventos este mês';

  /// Badge text displayed on the promoter seal.
  String get badgeText => tier == 'founder' ? 'PROMOTER FOUNDER' : 'PROMOTER PREMIUM';
}
