import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_theme.dart';

/// Premium vertical event card widget matching Lotus design aesthetics.
///
/// Can display either a [DevelopmentEvent] or an [EventsRecord].
class PremiumVerticalCardWidget extends StatelessWidget {
  final DevelopmentEvent? developmentEvent;
  final EventsRecord? eventsRecord;
  final VoidCallback? onTap;
  final double width;

  const PremiumVerticalCardWidget({
    super.key,
    this.developmentEvent,
    this.eventsRecord,
    this.onTap,
    this.width = 240.0,
  });

  String get title =>
      developmentEvent?.title ?? eventsRecord?.name ?? 'Evento Lotus';

  String get category =>
      developmentEvent?.category ??
      (eventsRecord?.categoria.isNotEmpty == true
          ? eventsRecord!.categoria.first
          : 'Música');

  String get locationName =>
      developmentEvent?.locationName ??
      (eventsRecord?.venueName.isNotEmpty == true
          ? eventsRecord!.venueName
          : (eventsRecord?.location ?? 'Porto'));

  String get distance => developmentEvent?.distance ?? 'Porto';

  DateTime? get dateTime =>
      developmentEvent?.dateTime ?? eventsRecord?.startDate;

  String get imageUrl =>
      developmentEvent?.image ??
      (eventsRecord?.image.isNotEmpty == true
          ? eventsRecord!.image
          : 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80');

  double get priceMin =>
      developmentEvent?.priceMin ?? eventsRecord?.priceMin ?? 0.0;

  bool get isFree =>
      developmentEvent?.isFree ?? eventsRecord?.isFree ?? (priceMin == 0.0);

  bool get isBoosted =>
      developmentEvent?.isBoosted ?? eventsRecord?.isBoosted ?? false;

  Color _getCategoryColor(String cat) {
    switch (cat.toLowerCase()) {
      case 'música':
      case 'musica':
        return const Color(0xFFA855F7);
      case 'social':
        return const Color(0xFF3B82F6);
      case 'arte':
        return const Color(0xFFEC4899);
      case 'drop':
        return const Color(0xFFFF6B00);
      default:
        return const Color(0xFF10B981);
    }
  }

  String _formatDate(DateTime? dt) {
    if (dt == null) return 'Em breve';
    final now = DateTime.now();
    final differenceDays = dt.difference(now).inDays;

    if (dt.day == now.day && dt.month == now.month && dt.year == now.year) {
      final minute = dt.minute.toString().padLeft(2, '0');
      return 'Hoje, ${dt.hour}:$minute';
    } else if (differenceDays == 1) {
      final minute = dt.minute.toString().padLeft(2, '0');
      return 'Amanhã, ${dt.hour}:$minute';
    } else {
      const months = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];
      final minute = dt.minute.toString().padLeft(2, '0');
      return '${dt.day} ${months[dt.month - 1]}, ${dt.hour}:$minute';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = FlutterFlowTheme.of(context);
    final categoryColor = _getCategoryColor(category);

    return InkWell(
      splashColor: Colors.transparent,
      focusColor: Colors.transparent,
      hoverColor: Colors.transparent,
      highlightColor: Colors.transparent,
      onTap: onTap,
      child: Container(
        width: width,
        decoration: BoxDecoration(
          color: theme.secondaryBackground,
          borderRadius: BorderRadius.circular(20.0),
          border: Border.all(
            color: isBoosted
                ? const Color(0x66FF6B00)
                : const Color(0xFF27272A),
            width: isBoosted ? 1.5 : 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: isBoosted
                  ? const Color(0x33FF6B00)
                  : const Color(0x22000000),
              blurRadius: isBoosted ? 16.0 : 10.0,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Poster Image with Overlay Tags
            Stack(
              children: [
                SizedBox(
                  height: 160.0,
                  width: double.infinity,
                  child: CachedNetworkImage(
                    imageUrl: imageUrl,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      color: const Color(0xFF1E1E24),
                      child: const Center(
                        child: CircularProgressIndicator(
                          strokeWidth: 2.0,
                          color: Color(0xFFA855F7),
                        ),
                      ),
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: const Color(0xFF1E1E24),
                      child: const Icon(
                        Icons.image_not_supported_rounded,
                        color: Color(0xFF71717A),
                      ),
                    ),
                  ),
                ),
                // Gradient overlay for text readability
                Positioned.fill(
                  child: Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.transparent,
                          Color(0xCC09090B),
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ),
                // Category Pill Badge
                Positioned(
                  top: 12.0,
                  left: 12.0,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10.0,
                      vertical: 4.0,
                    ),
                    decoration: BoxDecoration(
                      color: categoryColor.withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(999.0),
                      boxShadow: [
                        BoxShadow(
                          color: categoryColor.withValues(alpha: 0.4),
                          blurRadius: 8.0,
                        ),
                      ],
                    ),
                    child: Text(
                      category.toUpperCase(),
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.white,
                        fontSize: 10.5,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),
                ),
                // Boosted or Distance Badge
                Positioned(
                  top: 12.0,
                  right: 12.0,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8.0,
                      vertical: 4.0,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xCC000000),
                      borderRadius: BorderRadius.circular(8.0),
                      border: Border.all(
                        color: const Color(0x33FFFFFF),
                        width: 0.8,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.near_me_rounded,
                          color: Colors.white,
                          size: 11.0,
                        ),
                        const SizedBox(width: 4.0),
                        Text(
                          distance,
                          style: GoogleFonts.inter(
                            color: Colors.white,
                            fontSize: 11.0,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // Date & Time Banner at bottom of poster
                Positioned(
                  bottom: 8.0,
                  left: 12.0,
                  right: 12.0,
                  child: Row(
                    children: [
                      const Icon(
                        Icons.calendar_today_rounded,
                        color: Color(0xFFFAFAFA),
                        size: 12.0,
                      ),
                      const SizedBox(width: 6.0),
                      Expanded(
                        child: Text(
                          _formatDate(dateTime),
                          style: GoogleFonts.inter(
                            color: const Color(0xFFFAFAFA),
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            // Card Content
            Padding(
              padding: const EdgeInsets.all(14.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.plusJakartaSans(
                      color: theme.primaryText,
                      fontWeight: FontWeight.bold,
                      fontSize: 15.0,
                      height: 1.25,
                    ),
                  ),
                  const SizedBox(height: 6.0),
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on_rounded,
                        color: Color(0xFFA1A1AA),
                        size: 14.0,
                      ),
                      const SizedBox(width: 4.0),
                      Expanded(
                        child: Text(
                          locationName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            color: theme.secondaryText,
                            fontSize: 12.5,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12.0),
                  // Price and CTA Status Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8.0,
                          vertical: 4.0,
                        ),
                        decoration: BoxDecoration(
                          color: isFree
                              ? const Color(0x1A10B981)
                              : const Color(0x1AA855F7),
                          borderRadius: BorderRadius.circular(6.0),
                          border: Border.all(
                            color: isFree
                                ? const Color(0xFF10B981)
                                : const Color(0xFFA855F7),
                            width: 0.8,
                          ),
                        ),
                        child: Text(
                          isFree ? 'GRATUITO' : 'DESDE ${priceMin.toStringAsFixed(0)}€',
                          style: GoogleFonts.plusJakartaSans(
                            color: isFree
                                ? const Color(0xFF10B981)
                                : const Color(0xFFA855F7),
                            fontSize: 11.0,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      if (isBoosted)
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.bolt_rounded,
                              color: Color(0xFFFF6B00),
                              size: 16.0,
                            ),
                            Text(
                              'HOT',
                              style: GoogleFonts.plusJakartaSans(
                                color: const Color(0xFFFF6B00),
                                fontSize: 11.0,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
