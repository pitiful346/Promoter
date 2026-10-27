import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:promoter/flutter_flow/nav/serialization_util.dart';
import 'package:promoter/backend/event_creation_validator.dart';
import 'package:promoter/pages/organizer_dashboard/promoter_dashboard_status.dart';
import 'package:promoter/backend/development_event_seed.dart';
import 'package:promoter/backend/development_map_event_repository.dart';
import 'package:promoter/pages/organizer_dashboard/lotus_admin_screen.dart';

void main() {
  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    await initializeDateFormatting('pt_PT', null);
  });

  group('Promoter Serialization Tests', () {
    test('Serializes and deserializes primitive types correctly', () {
      expect(serializeParam(42, ParamType.int), equals('42'));
      expect(serializeParam(19.99, ParamType.double), equals('19.99'));
      expect(serializeParam('Lotus Event', ParamType.String), equals('Lotus Event'));
      expect(serializeParam(true, ParamType.bool), equals('true'));

      expect(deserializeParam('42', ParamType.int, false), equals(42));
      expect(deserializeParam('19.99', ParamType.double, false), equals(19.99));
      expect(deserializeParam('Lotus Event', ParamType.String, false), equals('Lotus Event'));
      expect(deserializeParam('true', ParamType.bool, false), equals(true));
    });

    test('Serializes and deserializes list parameters', () {
      final list = ['porto', 'gaia', 'matosinhos'];
      final serialized = serializeParam(list, ParamType.String, isList: true);
      expect(serialized, isNotNull);

      final deserialized = deserializeParam<String>(serialized, ParamType.String, true);
      expect(deserialized, equals(list));
    });
  });

  group('Freemium Event Creation Validation Tests', () {
    test('Non-promoters are strictly blocked from creating events', () {
      final result = evaluateFreemiumEventCreationQuota(
        isPromoter: false,
        subscriptionTier: 'free',
        eventsPublishedThisMonth: 0,
      );
      expect(result.allowed, isFalse);
      expect(result.errorMessage, contains('Apenas promotores autorizados'));
    });

    test('Free tier allows first event when counter is 0', () {
      final result = evaluateFreemiumEventCreationQuota(
        isPromoter: true,
        subscriptionTier: 'free',
        eventsPublishedThisMonth: 0,
      );
      expect(result.allowed, isTrue);
      expect(result.subscriptionTier, equals('free'));
    });

    test('Free tier blocks event when quota is 1 or more', () {
      final result = evaluateFreemiumEventCreationQuota(
        isPromoter: true,
        subscriptionTier: 'free',
        eventsPublishedThisMonth: 1,
      );
      expect(result.allowed, isFalse);
      expect(
        result.errorMessage,
        equals('Quota mensal esgotada. Faz upgrade para o plano Premium.'),
      );

      final resultExceeded = evaluateFreemiumEventCreationQuota(
        isPromoter: true,
        subscriptionTier: 'free',
        eventsPublishedThisMonth: 5,
      );
      expect(resultExceeded.allowed, isFalse);
      expect(
        resultExceeded.errorMessage,
        equals('Quota mensal esgotada. Faz upgrade para o plano Premium.'),
      );
    });

    test('Premium tier allows unlimited event creation regardless of counter', () {
      final result = evaluateFreemiumEventCreationQuota(
        isPromoter: true,
        subscriptionTier: 'premium',
        eventsPublishedThisMonth: 10,
      );
      expect(result.allowed, isTrue);
      expect(result.subscriptionTier, equals('premium'));
    });

    test('Founder tier allows unlimited event creation regardless of counter', () {
      final result = evaluateFreemiumEventCreationQuota(
        isPromoter: true,
        subscriptionTier: 'founder',
        eventsPublishedThisMonth: 99,
      );
      expect(result.allowed, isTrue);
      expect(result.subscriptionTier, equals('founder'));
    });
  });

  group('Promoter Dashboard Status UI Logic Tests', () {
    test('Free tier with 0 events: progress 0.0, active create button', () {
      const status = PromoterDashboardStatus(
        tier: 'free',
        eventsPublishedThisMonth: 0,
        isPromoter: true,
      );
      expect(status.isFree, isTrue);
      expect(status.isUnlimited, isFalse);
      expect(status.isQuotaExhausted, isFalse);
      expect(status.canCreateEvent, isTrue);
      expect(status.quotaDisplayText, equals('0/1 eventos este mês'));
      expect(status.progressRatio, equals(0.0));
    });

    test('Free tier with 1 event: progress 1.0, quota exhausted, disabled create button', () {
      const status = PromoterDashboardStatus(
        tier: 'free',
        eventsPublishedThisMonth: 1,
        isPromoter: true,
      );
      expect(status.isFree, isTrue);
      expect(status.isUnlimited, isFalse);
      expect(status.isQuotaExhausted, isTrue);
      expect(status.canCreateEvent, isFalse);
      expect(status.quotaDisplayText, equals('1/1 eventos este mês'));
      expect(status.progressRatio, equals(1.0));
    });

    test('Premium tier: unlimited privileges, PROMOTER PREMIUM badge, always active', () {
      const status = PromoterDashboardStatus(
        tier: 'premium',
        eventsPublishedThisMonth: 15,
        isPromoter: true,
      );
      expect(status.isFree, isFalse);
      expect(status.isUnlimited, isTrue);
      expect(status.isQuotaExhausted, isFalse);
      expect(status.canCreateEvent, isTrue);
      expect(status.badgeText, equals('PROMOTER PREMIUM'));
    });

    test('Founder tier: unlimited privileges, PROMOTER FOUNDER badge, always active', () {
      const status = PromoterDashboardStatus(
        tier: 'founder',
        eventsPublishedThisMonth: 50,
        isPromoter: true,
      );
      expect(status.isFree, isFalse);
      expect(status.isUnlimited, isTrue);
      expect(status.isQuotaExhausted, isFalse);
      expect(status.canCreateEvent, isTrue);
      expect(status.badgeText, equals('PROMOTER FOUNDER'));
    });
  });

  group('Porto Development Mock Events Tests', () {
    test('generateMockEvents returns 35 realistic events within Porto bounds', () {
      final events = generateMockEvents();
      expect(events.length, equals(35));

      final categories = <String>{};
      final now = DateTime.now();
      final twoWeeksFromNow = now.add(const Duration(days: 15));

      for (final event in events) {
        expect(event.id.isNotEmpty, isTrue);
        expect(event.title.isNotEmpty, isTrue);
        expect(event.locationName.isNotEmpty, isTrue);
        expect(event.distance.isNotEmpty, isTrue);
        expect(event.image.startsWith('https://images.unsplash.com'), isTrue);

        // Strict geographic boundaries: Lat 41.14 to 41.17, Lng -8.65 to -8.58
        expect(event.latitude, greaterThanOrEqualTo(41.140));
        expect(event.latitude, lessThanOrEqualTo(41.170));
        expect(event.longitude, greaterThanOrEqualTo(-8.650));
        expect(event.longitude, lessThanOrEqualTo(-8.580));

        // Date range from today to 2 weeks
        expect(event.dateTime.isAfter(now.subtract(const Duration(days: 1))), isTrue);
        expect(event.dateTime.isBefore(twoWeeksFromNow), isTrue);

        categories.add(event.category);
      }

      // Check required categories: Música, Social, Arte, Drop
      expect(categories.contains('Música'), isTrue);
      expect(categories.contains('Social'), isTrue);
      expect(categories.contains('Arte'), isTrue);
      expect(categories.contains('Drop'), isTrue);
    });

    test('generateMockEvents converts seamlessly to EventsRecord', () {
      final records = generateMockEventsRecords();
      expect(records.length, equals(35));

      final firstRecord = records.first;
      expect(firstRecord.name, equals('Sunset Ribeira & Wine Sessions'));
      expect(firstRecord.venueName, equals('Jardim do Morro'));
      expect(firstRecord.coordenadas, isNotNull);
      expect(firstRecord.coordenadas!.latitude, closeTo(41.1405, 0.001));
      expect(firstRecord.coordenadas!.longitude, closeTo(-8.6095, 0.001));
      expect(firstRecord.categoria, contains('Social'));
    });

    test('DevelopmentMapEventRepository filters by category and distance correctly', () async {
      final repo = DevelopmentMapEventRepository.instance;
      repo.resetMockEvents();

      final musicEvents = await repo.getEvents(category: 'Música');
      expect(musicEvents.isNotEmpty, isTrue);
      for (final e in musicEvents) {
        expect(e.category, equals('Música'));
      }

      final dropEvents = await repo.getEvents(category: 'Drop');
      expect(dropEvents.isNotEmpty, isTrue);
      for (final e in dropEvents) {
        expect(e.category, equals('Drop'));
      }

      final closeEvents = await repo.getEvents(maxDistanceKm: 1.0);
      expect(closeEvents.isNotEmpty, isTrue);
      for (final e in closeEvents) {
        expect(e.distanceKm, lessThanOrEqualTo(1.0));
      }

      // Bounding box query
      final baixaEvents = repo.getEventsInBoundingBox(
        minLat: 41.140,
        maxLat: 41.155,
        minLng: -8.625,
        maxLng: -8.600,
      );
      expect(baixaEvents.isNotEmpty, isTrue);
    });
  });

  group('LotusAdminScreen B2B Promoter Dashboard Tests', () {
    testWidgets('Renders LotusAdminScreen with 3 tabs and status card', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: LotusAdminScreen(),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('LOTUS PROMOTER'), findsOneWidget);
      expect(find.text('Dashboard'), findsOneWidget);
      expect(find.text('Os Meus Eventos'), findsOneWidget);
      expect(find.text('Criar Evento'), findsOneWidget);
      expect(find.text('Métricas de Desempenho'), findsOneWidget);
      expect(find.text('Total de Eventos'), findsOneWidget);
      expect(find.text('Cliques no Mapa'), findsOneWidget);
      expect(find.text('Pessoas no Radar'), findsOneWidget);
    });

    testWidgets('Can switch tabs between Dashboard, Os Meus Eventos, and Criar Evento', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: LotusAdminScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Tap on 'Os Meus Eventos' tab
      await tester.tap(find.text('Os Meus Eventos'));
      await tester.pumpAndSettle();

      // Tap on 'Criar Evento' tab
      await tester.tap(find.text('Criar Evento'));
      await tester.pumpAndSettle();

      expect(find.text('Criar Novo Evento'), findsOneWidget);
      expect(find.text('Título do Evento *'), findsOneWidget);
      expect(find.text('Categoria *'), findsOneWidget);
    });
  });
}
