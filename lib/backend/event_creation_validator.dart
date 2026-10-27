import 'package:cloud_firestore/cloud_firestore.dart';
import '/auth/firebase_auth/auth_util.dart';
import '/backend/schema/users_record.dart';

/// Result object for Freemium event creation validation.
class EventCreationValidationResult {
  final bool allowed;
  final String? errorMessage;
  final String? subscriptionTier;
  final int? eventsPublishedThisMonth;

  const EventCreationValidationResult({
    required this.allowed,
    this.errorMessage,
    this.subscriptionTier,
    this.eventsPublishedThisMonth,
  });

  factory EventCreationValidationResult.success({
    String? subscriptionTier,
    int? eventsPublishedThisMonth,
  }) =>
      EventCreationValidationResult(
        allowed: true,
        subscriptionTier: subscriptionTier,
        eventsPublishedThisMonth: eventsPublishedThisMonth,
      );

  factory EventCreationValidationResult.denied(String message) =>
      EventCreationValidationResult(
        allowed: false,
        errorMessage: message,
      );
}

/// Pure business logic validator that can be tested in isolation with user data.
EventCreationValidationResult evaluateFreemiumEventCreationQuota({
  required bool isPromoter,
  required String subscriptionTier,
  required int eventsPublishedThisMonth,
}) {
  // 1. Verify promoter role
  if (!isPromoter) {
    return EventCreationValidationResult.denied(
      'Apenas promotores autorizados podem criar eventos.',
    );
  }

  final tier = subscriptionTier.toLowerCase().trim();

  // 2. Premium or Founder tier: unlimited creation
  if (tier == 'premium' || tier == 'founder') {
    return EventCreationValidationResult.success(
      subscriptionTier: tier,
      eventsPublishedThisMonth: eventsPublishedThisMonth,
    );
  }

  // 3. Free tier: quota check (max 1 event per month)
  if (eventsPublishedThisMonth >= 1) {
    return EventCreationValidationResult.denied(
      'Quota mensal esgotada. Faz upgrade para o plano Premium.',
    );
  }

  return EventCreationValidationResult.success(
    subscriptionTier: 'free',
    eventsPublishedThisMonth: eventsPublishedThisMonth,
  );
}

/// Validates whether the authenticated user is allowed to create/publish a new event
/// based on the Freemium subscription model.
///
/// Runs before writing the event document to the database:
/// - Checks if is_promoter == true.
/// - If subscription_tier == 'free': checks if events_published_this_month < 1.
///   If valid, allows creation and increments events_published_this_month.
///   If >= 1, blocks creation and returns error:
///   'Quota mensal esgotada. Faz upgrade para o plano Premium.'.
/// - If subscription_tier == 'premium' or 'founder': allows unlimited creation.
Future<EventCreationValidationResult> validateEventCreation({
  DocumentReference? userRef,
}) async {
  final ref = userRef ?? currentUserReference;
  if (ref == null) {
    return EventCreationValidationResult.denied(
      'Utilizador não autenticado.',
    );
  }

  try {
    final userSnapshot = await ref.get();
    if (!userSnapshot.exists) {
      return EventCreationValidationResult.denied(
        'Perfil de utilizador não encontrado.',
      );
    }

    final userRecord = UsersRecord.fromSnapshot(userSnapshot);
    final evaluation = evaluateFreemiumEventCreationQuota(
      isPromoter: userRecord.isPromoter,
      subscriptionTier: userRecord.subscriptionTier,
      eventsPublishedThisMonth: userRecord.eventsPublishedThisMonth,
    );

    if (!evaluation.allowed) {
      return evaluation;
    }

    // If allowed under Free tier, increment the monthly counter
    final tier = userRecord.subscriptionTier.toLowerCase().trim();
    if (tier == 'free' || (tier != 'premium' && tier != 'founder')) {
      await ref.update({
        'events_published_this_month': FieldValue.increment(1),
      });
    }

    return evaluation;
  } catch (e) {
    print('Error in validateEventCreation: $e');
    return EventCreationValidationResult.denied(
      'Erro ao validar permissões de criação de evento: $e',
    );
  }
}
