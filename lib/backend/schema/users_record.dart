import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class UsersRecord extends FirestoreRecord {
  UsersRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "email" field.
  String? _email;
  String get email => _email ?? '';
  bool hasEmail() => _email != null;

  // "display_name" field.
  String? _displayName;
  String get displayName => _displayName ?? '';
  bool hasDisplayName() => _displayName != null;

  // "uid" field.
  String? _uid;
  String get uid => _uid ?? '';
  bool hasUid() => _uid != null;

  // "created_time" field.
  DateTime? _createdTime;
  DateTime? get createdTime => _createdTime;
  bool hasCreatedTime() => _createdTime != null;

  // "is_promoter" field.
  bool? _isPromoter;
  bool get isPromoter => _isPromoter ?? false;
  bool hasIsPromoter() => _isPromoter != null;

  // "phone_number" field.
  String? _phoneNumber;
  String get phoneNumber => _phoneNumber ?? '';
  bool hasPhoneNumber() => _phoneNumber != null;

  // "photo_url" field.
  String? _photoUrl;
  String get photoUrl => _photoUrl ?? '';
  bool hasPhotoUrl() => _photoUrl != null;

  // "subscription_tier" field.
  String? _subscriptionTier;
  String get subscriptionTier => _subscriptionTier ?? 'free';
  bool hasSubscriptionTier() => _subscriptionTier != null;

  // "events_published_this_month" field.
  int? _eventsPublishedThisMonth;
  int get eventsPublishedThisMonth => _eventsPublishedThisMonth ?? 0;
  bool hasEventsPublishedThisMonth() => _eventsPublishedThisMonth != null;

  // "last_reset_date" field.
  DateTime? _lastResetDate;
  DateTime? get lastResetDate => _lastResetDate;
  bool hasLastResetDate() => _lastResetDate != null;

  void _initializeFields() {
    _email = snapshotData['email'] as String?;
    _displayName = snapshotData['display_name'] as String?;
    _uid = snapshotData['uid'] as String?;
    _createdTime = snapshotData['created_time'] as DateTime?;
    _isPromoter = snapshotData['is_promoter'] as bool?;
    _phoneNumber = snapshotData['phone_number'] as String?;
    _photoUrl = snapshotData['photo_url'] as String?;
    _subscriptionTier = snapshotData['subscription_tier'] as String?;
    _eventsPublishedThisMonth =
        castToType<int>(snapshotData['events_published_this_month']);
    _lastResetDate = snapshotData['last_reset_date'] as DateTime?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('users');

  static Stream<UsersRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => UsersRecord.fromSnapshot(s));

  static Future<UsersRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => UsersRecord.fromSnapshot(s));

  static UsersRecord fromSnapshot(DocumentSnapshot snapshot) => UsersRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static UsersRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      UsersRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'UsersRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is UsersRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createUsersRecordData({
  String? email,
  String? displayName,
  String? uid,
  DateTime? createdTime,
  bool? isPromoter,
  String? phoneNumber,
  String? photoUrl,
  String? subscriptionTier,
  int? eventsPublishedThisMonth,
  DateTime? lastResetDate,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'email': email,
      'display_name': displayName,
      'uid': uid,
      'created_time': createdTime,
      'is_promoter': isPromoter,
      'phone_number': phoneNumber,
      'photo_url': photoUrl,
      'subscription_tier': subscriptionTier,
      'events_published_this_month': eventsPublishedThisMonth,
      'last_reset_date': lastResetDate,
    }.withoutNulls,
  );

  return firestoreData;
}

class UsersRecordDocumentEquality implements Equality<UsersRecord> {
  const UsersRecordDocumentEquality();

  @override
  bool equals(UsersRecord? e1, UsersRecord? e2) {
    return e1?.email == e2?.email &&
        e1?.displayName == e2?.displayName &&
        e1?.uid == e2?.uid &&
        e1?.createdTime == e2?.createdTime &&
        e1?.isPromoter == e2?.isPromoter &&
        e1?.phoneNumber == e2?.phoneNumber &&
        e1?.photoUrl == e2?.photoUrl &&
        e1?.subscriptionTier == e2?.subscriptionTier &&
        e1?.eventsPublishedThisMonth == e2?.eventsPublishedThisMonth &&
        e1?.lastResetDate == e2?.lastResetDate;
  }

  @override
  int hash(UsersRecord? e) => const ListEquality().hash([
        e?.email,
        e?.displayName,
        e?.uid,
        e?.createdTime,
        e?.isPromoter,
        e?.phoneNumber,
        e?.photoUrl,
        e?.subscriptionTier,
        e?.eventsPublishedThisMonth,
        e?.lastResetDate,
      ]);

  @override
  bool isValidKey(Object? o) => o is UsersRecord;
}
