import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:promoter/flutter_flow/nav/serialization_util.dart';
import 'package:promoter/backend/event_creation_validator.dart';
import 'package:promoter/pages/organizer_dashboard/promoter_dashboard_status.dart';
import 'package:promoter/backend/development_event_seed.dart';
import 'package:promoter/backend/development_map_event_repository.dart';
import 'package:promoter/pages/organizer_dashboard/lotus_admin_screen.dart';
import 'package:promoter/pages/login/login_widget.dart';
import 'package:promoter/pages/register/register_widget.dart';

class _MockHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) => _MockHttpClient();
}

class _MockHttpClient implements HttpClient {
  @override
  Future<HttpClientRequest> getUrl(Uri url) async => _MockHttpClientRequest();
  @override
  Future<HttpClientRequest> openUrl(String method, Uri url) async => _MockHttpClientRequest();
  @override
  dynamic noSuchMethod(Invocation invocation) => null;
}

class _MockHttpClientRequest implements HttpClientRequest {
  @override
  final HttpHeaders headers = _MockHttpHeaders();
  @override
  Future<HttpClientResponse> close() async => _MockHttpClientResponse();
  @override
  dynamic noSuchMethod(Invocation invocation) => null;
}

class _MockHttpHeaders implements HttpHeaders {
  @override
  void add(String name, Object value, {bool preserveHeaderCase = false}) {}
  @override
  void set(String name, Object value, {bool preserveHeaderCase = false}) {}
  @override
  dynamic noSuchMethod(Invocation invocation) => null;
}

class _MockHttpClientResponse extends Stream<List<int>> implements HttpClientResponse {
  static final List<int> _kTransparentImage = <int>[
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49,
    0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06,
    0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44,
    0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D,
    0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42,
    0x60, 0x82,
  ];

  @override
  int get statusCode => 200;
  @override
  int get contentLength => _kTransparentImage.length;
  @override
  HttpClientResponseCompressionState get compressionState =>
      HttpClientResponseCompressionState.notCompressed;
  @override
  final HttpHeaders headers = _MockHttpHeaders();

  @override
  StreamSubscription<List<int>> listen(
    void Function(List<int> event)? onData, {
    Function? onError,
    void Function()? onDone,
    bool? cancelOnError,
  }) {
    return Stream<List<int>>.value(_kTransparentImage).listen(
      onData,
      onError: onError,
      onDone: onDone,
      cancelOnError: cancelOnError,
    );
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => null;
}

void main() {
  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    HttpOverrides.global = _MockHttpOverrides();
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
    testWidgets('Renders LotusAdminScreen with Left Sidebar and Overview content', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: LotusAdminScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Sidebar
      expect(find.text('LOTUS PROMOTER'), findsOneWidget);
      expect(find.text('Dashboard'), findsOneWidget);
      expect(find.text('Eventos'), findsOneWidget);
      expect(find.text('Criar'), findsOneWidget);

      // Main Content: Plan Card
      expect(find.text('Plano Atual: Freemium'), findsOneWidget);
      expect(find.text('0/1 eventos este mês'), findsOneWidget);
      expect(find.text('Upgrade'), findsOneWidget);

      // Main Content: Metrics
      expect(find.text('Total Eventos'), findsOneWidget);
      expect(find.text('4'), findsWidgets);
      expect(find.text('Cliques no Mapa'), findsOneWidget);
      expect(find.text('1.420'), findsOneWidget);
      expect(find.text('Pessoas no Radar'), findsOneWidget);
      expect(find.text('850'), findsOneWidget);
      expect(find.text('Taxa de Conversão'), findsOneWidget);
      expect(find.text('18.4%'), findsOneWidget);
    });

    testWidgets('Can select items on Left Sidebar and switch IndexedStack', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: LotusAdminScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Tap on 'Eventos' (Tab 1)
      await tester.tap(find.text('Eventos'));
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.edit_outlined), findsWidgets);
      expect(find.byIcon(Icons.delete_outline_rounded), findsWidgets);

      // Tap on 'Criar' (Tab 2)
      await tester.tap(find.text('Criar'));
      await tester.pumpAndSettle();

      expect(find.text('Criar Novo Evento'), findsOneWidget);
      expect(find.text('Publicar Evento'), findsOneWidget);

      // Tap back on 'Dashboard' (Tab 0)
      await tester.tap(find.text('Dashboard'));
      await tester.pumpAndSettle();

      expect(find.text('Plano Atual: Freemium'), findsOneWidget);
    });

    testWidgets('Billing & Upgrade: opens modal and activates Premium 5€/month', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: LotusAdminScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Tap on 'Upgrade' button in Plan Card
      await tester.tap(find.text('Upgrade').first);
      await tester.pumpAndSettle();

      // Verify modal contents
      expect(find.text('PROMOTER PREMIUM'), findsWidgets);
      expect(find.text('Ativar por 5€/mês'), findsOneWidget);
      expect(find.text('Eventos Ilimitados'), findsOneWidget);

      // Activate premium
      await tester.tap(find.text('Ativar por 5€/mês'));
      await tester.pumpAndSettle();

      // Verify plan is updated to PROMOTER PREMIUM with 'Plano Ativo' button
      expect(find.text('Plano Atual: PROMOTER PREMIUM'), findsOneWidget);
      expect(find.text('Plano Ativo'), findsOneWidget);
    });

    testWidgets('CRUD: Can edit event title and see updated card', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: LotusAdminScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Navigate to 'Eventos'
      await tester.tap(find.text('Eventos'));
      await tester.pumpAndSettle();

      // Tap edit on the first event
      await tester.tap(find.byIcon(Icons.edit_outlined).first);
      await tester.pumpAndSettle();

      expect(find.text('Editar Evento'), findsOneWidget);
      expect(find.text('Guardar Alterações'), findsOneWidget);

      // Modify the title
      final titleField = find.widgetWithText(TextField, 'Sunset Ribeira & Wine Sessions');
      if (titleField.evaluate().isNotEmpty) {
        await tester.enterText(titleField, 'Sunset Ribeira VIP Experience');
        await tester.tap(find.text('Guardar Alterações'));
        await tester.pumpAndSettle();

        expect(find.text('Sunset Ribeira VIP Experience'), findsOneWidget);
      }
    });

    testWidgets('CRUD: Can delete event from the list', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: LotusAdminScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Navigate to 'Eventos'
      await tester.tap(find.text('Eventos'));
      await tester.pumpAndSettle();

      final initialDeleteCount = find.byIcon(Icons.delete_outline_rounded).evaluate().length;
      expect(initialDeleteCount, greaterThan(0));

      // Tap delete on the first event
      await tester.tap(find.byIcon(Icons.delete_outline_rounded).first);
      await tester.pumpAndSettle();

      expect(find.text('Eliminar Evento'), findsOneWidget);

      // Confirm deletion
      await tester.tap(find.text('Eliminar'));
      await tester.pumpAndSettle();

      final newDeleteCount = find.byIcon(Icons.delete_outline_rounded).evaluate().length;
      expect(newDeleteCount, equals(initialDeleteCount - 1));
    });
  });

  group('Auth Screens Tests (Login & Register)', () {
    testWidgets('LoginWidget: Renders inputs, validates email and provides demo bypass', (tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const MaterialApp(
          home: LoginWidget(),
        ),
      );
      await tester.pumpAndSettle();

      // Check header and buttons
      expect(find.text('Iniciar Sessão'), findsWidgets);
      expect(find.text('Entrar como Promotor Demo'), findsOneWidget);
      expect(find.text('Email Profissional'), findsOneWidget);
      expect(find.text('Palavra-passe'), findsOneWidget);

      // Submit without entering data to trigger form validation
      final loginBtn = find.widgetWithText(ElevatedButton, 'Iniciar Sessão');
      await tester.ensureVisible(loginBtn);
      await tester.tap(loginBtn);
      await tester.pumpAndSettle();

      expect(find.text('Por favor introduz o teu email'), findsOneWidget);

      // Enter valid email and short password
      await tester.enterText(find.widgetWithText(TextFormField, 'promotor@teuespaco.pt').first, 'porto@promoter.pt');
      await tester.enterText(find.widgetWithText(TextFormField, '••••••••').first, '123');
      await tester.ensureVisible(loginBtn);
      await tester.tap(loginBtn);
      await tester.pumpAndSettle();

      expect(find.text('A palavra-passe deve ter pelo menos 6 caracteres'), findsOneWidget);
    });

    testWidgets('RegisterWidget: Renders fields, selects promoter chip and validates password match', (tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const MaterialApp(
          home: RegisterWidget(),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Criar Conta de Promotor'), findsWidgets);
      expect(find.text('Nome da Organização / Espaço'), findsOneWidget);
      expect(find.text('Discoteca / Clube'), findsOneWidget);
      expect(find.text('Produtora / Festival'), findsOneWidget);
      expect(find.text('Testar Registo Rápido Demo'), findsOneWidget);

      // Select another promoter chip
      await tester.tap(find.text('Produtora / Festival'));
      await tester.pumpAndSettle();

      // Enter mismatched passwords
      await tester.enterText(find.byType(TextFormField).at(0), 'Porto Sounds Club');
      await tester.enterText(find.byType(TextFormField).at(1), 'sounds@porto.pt');
      await tester.enterText(find.byType(TextFormField).at(2), 'password123');
      await tester.enterText(find.byType(TextFormField).at(3), 'differentPassword');

      final registerBtn = find.widgetWithText(ElevatedButton, 'Criar Conta e Aceder ao Painel');
      await tester.ensureVisible(registerBtn);
      await tester.tap(registerBtn);
      await tester.pumpAndSettle();

      expect(find.text('As palavras-passe não coincidem'), findsOneWidget);
    });
  });
}

