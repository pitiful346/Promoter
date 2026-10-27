import 'dart:async';
import 'package:flutter/foundation.dart';
import '/backend/schema/events_record.dart';
import 'development_event_seed.dart';

/// Abstract contract for Map Event repositories in Lotus,
/// allowing easy switching between Mock/Development mode and Production Firestore.
abstract class IMapEventRepository {
  Stream<List<DevelopmentEvent>> watchEvents({
    String? category,
    double? maxDistanceKm,
  });

  Future<List<DevelopmentEvent>> getEvents({
    String? category,
    double? maxDistanceKm,
  });

  Stream<List<EventsRecord>> watchEventsRecords({
    String? category,
  });

  Future<DevelopmentEvent?> getEventById(String id);

  List<DevelopmentEvent> getEventsInBoundingBox({
    required double minLat,
    required double maxLat,
    required double minLng,
    required double maxLng,
  });
}

/// Development & Debug Map Event Repository.
///
/// Feeds the UI directly with the 20 Porto realistic mock events,
/// providing real-time streams, category filtering, Mapbox clustering support,
/// and bidirectional conversion with [EventsRecord].
class DevelopmentMapEventRepository implements IMapEventRepository {
  static final DevelopmentMapEventRepository _instance =
      DevelopmentMapEventRepository._internal();

  /// Singleton instance for project-wide access in debug/testing.
  factory DevelopmentMapEventRepository() => _instance;
  static DevelopmentMapEventRepository get instance => _instance;

  DevelopmentMapEventRepository._internal() {
    _events = generateMockEvents();
    _eventsController = StreamController<List<DevelopmentEvent>>.broadcast(
      onListen: () {
        _eventsController.add(_events);
      },
    );
  }

  /// Whether development mode is active (defaults to true in debug mode).
  bool useMockData = kDebugMode;

  late List<DevelopmentEvent> _events;
  late final StreamController<List<DevelopmentEvent>> _eventsController;

  /// Direct synchronous access to current in-memory events.
  List<DevelopmentEvent> get currentEvents => List.unmodifiable(_events);

  /// Streams events matching the optional category and distance filters.
  @override
  Stream<List<DevelopmentEvent>> watchEvents({
    String? category,
    double? maxDistanceKm,
  }) {
    return _eventsController.stream.map((list) {
      return _filterList(list, category: category, maxDistanceKm: maxDistanceKm);
    });
  }

  /// Fetches events matching the optional category and distance filters.
  @override
  Future<List<DevelopmentEvent>> getEvents({
    String? category,
    double? maxDistanceKm,
  }) async {
    return _filterList(_events, category: category, maxDistanceKm: maxDistanceKm);
  }

  /// Streams events as [EventsRecord] objects, allowing drop-in integration
  /// with existing FlutterFlow / Flutter StreamBuilders and event card lists.
  @override
  Stream<List<EventsRecord>> watchEventsRecords({
    String? category,
  }) {
    return watchEvents(category: category).map((list) {
      return list.map((e) => e.toEventsRecord()).toList();
    });
  }

  /// Finds a single event by ID.
  @override
  Future<DevelopmentEvent?> getEventById(String id) async {
    try {
      return _events.firstWhere((e) => e.id == id);
    } catch (_) {
      return null;
    }
  }

  /// Returns events situated strictly within the requested geographic bounding box.
  /// Crucial for Mapbox viewport clustering and map queries.
  @override
  List<DevelopmentEvent> getEventsInBoundingBox({
    required double minLat,
    required double maxLat,
    required double minLng,
    required double maxLng,
  }) {
    return _events.where((e) {
      return e.latitude >= minLat &&
          e.latitude <= maxLat &&
          e.longitude >= minLng &&
          e.longitude <= maxLng;
    }).toList();
  }

  /// Adds or updates an event in the mock repository and notifies listeners.
  void addOrUpdateEvent(DevelopmentEvent event) {
    final index = _events.indexWhere((e) => e.id == event.id);
    if (index >= 0) {
      _events[index] = event;
    } else {
      _events.insert(0, event);
    }
    _eventsController.add(_events);
  }

  /// Resets the in-memory mock events back to the original 20 Porto seed events.
  void resetMockEvents() {
    _events = generateMockEvents();
    _eventsController.add(_events);
  }

  List<DevelopmentEvent> _filterList(
    List<DevelopmentEvent> list, {
    String? category,
    double? maxDistanceKm,
  }) {
    var result = list;

    if (category != null &&
        category.isNotEmpty &&
        category.toLowerCase() != 'todos') {
      result = result
          .where((e) => e.category.toLowerCase() == category.toLowerCase())
          .toList();
    }

    if (maxDistanceKm != null && maxDistanceKm > 0) {
      result = result.where((e) => e.distanceKm <= maxDistanceKm).toList();
    }

    return result;
  }

  void dispose() {
    _eventsController.close();
  }
}
