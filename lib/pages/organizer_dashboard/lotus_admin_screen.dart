import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';

/// Professional B2B Promoter Dashboard with Sidebar + IndexedStack architecture.
/// 
/// Core Features:
/// 1. Gestão do Plano (Billing & Upgrade: Free vs Premium toggle & 5€/mês activation dialog)
/// 2. Criação Rápida de Eventos (Title, Date, Time, Location Picker, Image, and Freemium quota block)
/// 3. Listagem e Gestão CRUD (Edit and Delete actions with real-time repository sync)
/// 4. Dashboard de Métricas (Analytics & Proof of Value for the 5€ upgrade)
class LotusAdminScreen extends StatefulWidget {
  const LotusAdminScreen({super.key});

  static String routeName = 'LotusAdmin';
  static String routePath = '/lotusAdmin';

  @override
  State<LotusAdminScreen> createState() => _LotusAdminScreenState();
}

class _LotusAdminScreenState extends State<LotusAdminScreen> {
  int _selectedIndex = 0;

  // Plan & Quota State
  String _subscriptionTier = 'free'; // 'free' or 'premium'
  int _eventsPublishedThisMonth = 0;

  // Brand Palette
  static const Color neonOrange = Color(0xFFFF5E00);
  static const Color activeTileBg = Color(0xFFFEE2E2);
  static const Color scaffoldBg = Color(0xFFF3F4F6);
  static const Color textDark = Color(0xFF111827);
  static const Color textMedium = Color(0xFF4B5563);
  static const Color textMuted = Color(0xFF6B7280);
  static const Color borderColor = Color(0xFFE5E7EB);

  // Events CRUD state
  List<DevelopmentEvent> _myEvents = [];

  // Form Controllers (Criar Evento)
  final _createFormKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _locationNameController = TextEditingController(text: 'Plano B');
  final _locationAddressController =
      TextEditingController(text: 'Rua Cândido dos Reis 30, 4050-151 Porto');
  final _priceController = TextEditingController(text: '0.00');
  final _customImageController = TextEditingController();

  String _selectedCategory = 'Música';
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 2));
  TimeOfDay _selectedTime = const TimeOfDay(hour: 22, minute: 0);
  bool _isFree = true;
  double _latitude = 41.1470;
  double _longitude = -8.6145;
  String _selectedPosterUrl =
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1080&auto=format&fit=crop&q=80';

  // Sample curated event posters
  final List<String> _samplePosters = [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1080&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1080&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1080&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1080&auto=format&fit=crop&q=80',
  ];

  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  void _initializeData() {
    // Read user document if present
    final user = currentUserDocument;
    if (user != null) {
      _subscriptionTier =
          user.subscriptionTier.isNotEmpty ? user.subscriptionTier : 'free';
      _eventsPublishedThisMonth = user.eventsPublishedThisMonth;
    } else {
      _subscriptionTier = 'free';
      _eventsPublishedThisMonth = 0;
    }

    // Load initial promoter events from repository (taking first 4)
    final repoEvents = DevelopmentMapEventRepository.instance.currentEvents;
    if (repoEvents.isNotEmpty) {
      _myEvents = List<DevelopmentEvent>.from(repoEvents.take(4));
    } else {
      _myEvents = List<DevelopmentEvent>.from(generateMockEvents().take(4));
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _locationNameController.dispose();
    _locationAddressController.dispose();
    _priceController.dispose();
    _customImageController.dispose();
    super.dispose();
  }

  bool get _isQuotaExhausted =>
      _subscriptionTier == 'free' && _eventsPublishedThisMonth >= 1;

  String _formatDateTime(DateTime dt) {
    try {
      return DateFormat('EEE, d MMM • HH:mm', 'pt_PT').format(dt);
    } catch (_) {
      return DateFormat('EEE, d MMM • HH:mm').format(dt);
    }
  }

  // ===========================================================================
  // FEATURE 1: GESTÃO DO PLANO (Billing & Upgrade Modal)
  // ===========================================================================
  void _showUpgradeDialog() {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.0)),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10.0),
                      decoration: BoxDecoration(
                        color: neonOrange.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      child: const Icon(
                        Icons.workspace_premium_rounded,
                        color: neonOrange,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 14.0),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'PROMOTER PREMIUM',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: textDark,
                            ),
                          ),
                          Text(
                            'Desbloqueia visibilidade máxima no Porto',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20.0),
                const Divider(color: borderColor, height: 1),
                const SizedBox(height: 16.0),

                _buildBenefitItem(
                  icon: Icons.all_inclusive_rounded,
                  title: 'Eventos Ilimitados',
                  description:
                      'Sem restrições mensais. Publica quantos eventos e drops quiseres.',
                ),
                _buildBenefitItem(
                  icon: Icons.star_rounded,
                  title: 'Pins em Destaque no Mapa Mapbox',
                  description:
                      'Os teus eventos aparecem com animação pulsante e maior raio de visibilidade.',
                ),
                _buildBenefitItem(
                  icon: Icons.radar_rounded,
                  title: 'Notificações de Proximidade',
                  description:
                      'Avisa instantaneamente participantes que estejam no raio de 2km do teu espaço.',
                ),
                _buildBenefitItem(
                  icon: Icons.insights_rounded,
                  title: 'Métricas Completas de Conversão',
                  description:
                      'Acompanha cliques, visualizações e utilizadores que guardaram o evento.',
                ),

                const SizedBox(height: 24.0),

                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: borderColor),
                          padding: const EdgeInsets.symmetric(vertical: 14.0),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                        ),
                        onPressed: () => Navigator.of(ctx).pop(),
                        child: Text(
                          'Agora Não',
                          style: GoogleFonts.inter(
                            color: textMuted,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12.0),
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: neonOrange,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 14.0),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                        ),
                        onPressed: () {
                          setState(() {
                            _subscriptionTier = 'premium';
                          });
                          Navigator.of(ctx).pop();

                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: textDark,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              content: Row(
                                children: [
                                  const Icon(Icons.check_circle_rounded,
                                      color: Color(0xFF10B981)),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      'Parabéns! O teu plano PROMOTER PREMIUM foi ativado.',
                                      style: GoogleFonts.inter(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                        child: Text(
                          'Ativar por 5€/mês',
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBenefitItem({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: neonOrange, size: 20),
          const SizedBox(width: 12.0),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: textDark,
                  ),
                ),
                Text(
                  description,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: textMuted,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ===========================================================================
  // FEATURE 2: CRIAÇÃO RÁPIDA DE EVENTOS (Submit Logic & Quota Lock)
  // ===========================================================================
  void _submitCreateEvent() {
    // 1. Quota Enforcement:
    if (_isQuotaExhausted) {
      _showUpgradeDialog();
      return;
    }

    if (!_createFormKey.currentState!.validate()) {
      return;
    }

    final eventDateTime = DateTime(
      _selectedDate.year,
      _selectedDate.month,
      _selectedDate.day,
      _selectedTime.hour,
      _selectedTime.minute,
    );

    final finalPoster = _customImageController.text.trim().isNotEmpty
        ? _customImageController.text.trim()
        : _selectedPosterUrl;

    final newEvent = DevelopmentEvent(
      id: 'event_${DateTime.now().millisecondsSinceEpoch}',
      title: _titleController.text.trim(),
      category: _selectedCategory,
      dateTime: eventDateTime,
      endDate: eventDateTime.add(const Duration(hours: 4)),
      locationName: _locationNameController.text.trim(),
      locationAddress: _locationAddressController.text.trim(),
      latitude: _latitude,
      longitude: _longitude,
      distance: '350 m',
      distanceKm: 0.35,
      image: finalPoster,
      priceMin: _isFree ? 0.0 : (double.tryParse(_priceController.text) ?? 10.0),
      isFree: _isFree,
      ticketStatus: 'AVAILABLE',
      description: 'Evento organizado no Porto com confirmação direta na app.',
      clickCount: 1,
      isBoosted: _subscriptionTier == 'premium',
    );

    setState(() {
      _myEvents.insert(0, newEvent);
      if (_subscriptionTier == 'free') {
        _eventsPublishedThisMonth += 1;
      }
      _selectedIndex = 1; // Redireciona para Meus Eventos
    });

    // Sincroniza com repositório global do Porto
    DevelopmentMapEventRepository.instance.addEvent(newEvent);

    // Reset controllers
    _titleController.clear();
    _customImageController.clear();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF10B981),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.0)),
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Evento "${newEvent.title}" publicado com sucesso no mapa!',
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ===========================================================================
  // FEATURE 3: CRUD ACTIONS (Edit and Delete)
  // ===========================================================================
  void _showEditEventDialog(DevelopmentEvent event) {
    final editTitleController = TextEditingController(text: event.title);
    final editLocationController =
        TextEditingController(text: event.locationName);
    final editPriceController =
        TextEditingController(text: event.priceMin.toStringAsFixed(2));
    String editCategory = event.category;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => Dialog(
          backgroundColor: Colors.white,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.0)),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 500),
            child: Padding(
              padding: const EdgeInsets.all(28.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Editar Evento',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: textDark,
                    ),
                  ),
                  const SizedBox(height: 18.0),

                  // Título
                  Text('Título do Evento',
                      style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: textDark)),
                  const SizedBox(height: 6.0),
                  TextField(
                    controller: editTitleController,
                    decoration: _inputDecoration('Título'),
                  ),
                  const SizedBox(height: 14.0),

                  // Localização
                  Text('Localização',
                      style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: textDark)),
                  const SizedBox(height: 6.0),
                  TextField(
                    controller: editLocationController,
                    decoration: _inputDecoration('Nome do espaço'),
                  ),
                  const SizedBox(height: 14.0),

                  // Categoria & Preço
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Categoria',
                                style: GoogleFonts.inter(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: textDark)),
                            const SizedBox(height: 6.0),
                            DropdownButtonFormField<String>(
                              initialValue: editCategory,
                              decoration: _inputDecoration(''),
                              items: const [
                                DropdownMenuItem(
                                    value: 'Música', child: Text('Música')),
                                DropdownMenuItem(
                                    value: 'Social', child: Text('Social')),
                                DropdownMenuItem(
                                    value: 'Arte', child: Text('Arte')),
                                DropdownMenuItem(
                                    value: 'Drop', child: Text('Drop')),
                              ],
                              onChanged: (val) {
                                if (val != null) {
                                  setDialogState(() => editCategory = val);
                                }
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 14.0),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Preço (€)',
                                style: GoogleFonts.inter(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: textDark)),
                            const SizedBox(height: 6.0),
                            TextField(
                              controller: editPriceController,
                              keyboardType: TextInputType.number,
                              decoration: _inputDecoration('0.00'),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24.0),

                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: borderColor),
                            padding: const EdgeInsets.symmetric(vertical: 12.0),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                          ),
                          onPressed: () => Navigator.of(ctx).pop(),
                          child: Text('Cancelar',
                              style: GoogleFonts.inter(
                                  color: textMuted,
                                  fontWeight: FontWeight.w600)),
                        ),
                      ),
                      const SizedBox(width: 12.0),
                      Expanded(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: neonOrange,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(vertical: 12.0),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                          ),
                          onPressed: () {
                            final newTitle = editTitleController.text.trim();
                            final newLocation =
                                editLocationController.text.trim();
                            final newPrice =
                                double.tryParse(editPriceController.text) ??
                                    event.priceMin;

                            if (newTitle.isEmpty) return;

                            final updatedEvent = DevelopmentEvent(
                              id: event.id,
                              title: newTitle,
                              category: editCategory,
                              dateTime: event.dateTime,
                              endDate: event.endDate,
                              locationName: newLocation.isNotEmpty
                                  ? newLocation
                                  : event.locationName,
                              locationAddress: event.locationAddress,
                              latitude: event.latitude,
                              longitude: event.longitude,
                              distance: event.distance,
                              distanceKm: event.distanceKm,
                              image: event.image,
                              priceMin: newPrice,
                              isFree: newPrice == 0.0,
                              ticketStatus: event.ticketStatus,
                              description: event.description,
                              clickCount: event.clickCount,
                              isBoosted: event.isBoosted,
                            );

                            setState(() {
                              final idx = _myEvents
                                  .indexWhere((e) => e.id == event.id);
                              if (idx >= 0) {
                                _myEvents[idx] = updatedEvent;
                              }
                            });

                            DevelopmentMapEventRepository.instance
                                .addOrUpdateEvent(updatedEvent);

                            Navigator.of(ctx).pop();

                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                backgroundColor: textDark,
                                content: Text(
                                  'Evento "$newTitle" atualizado com sucesso.',
                                  style: GoogleFonts.inter(color: Colors.white),
                                ),
                              ),
                            );
                          },
                          child: Text('Guardar Alterações',
                              style: GoogleFonts.inter(
                                  fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _confirmDeleteEvent(DevelopmentEvent event) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14.0)),
        title: Text(
          'Eliminar Evento',
          style: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.bold,
            color: textDark,
          ),
        ),
        content: Text(
          'Tens a certeza que pretendes eliminar o evento "${event.title}"? Esta ação removerá o evento do mapa de todos os participantes.',
          style: GoogleFonts.inter(fontSize: 13, color: textMedium),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text('Cancelar',
                style: GoogleFonts.inter(color: textMuted, fontWeight: FontWeight.w600)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
              elevation: 0,
            ),
            onPressed: () {
              setState(() {
                _myEvents.removeWhere((e) => e.id == event.id);
              });
              DevelopmentMapEventRepository.instance.deleteEvent(event.id);
              Navigator.of(ctx).pop();

              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: textDark,
                  content: Text(
                    'Evento "${event.title}" eliminado.',
                    style: GoogleFonts.inter(color: Colors.white),
                  ),
                ),
              );
            },
            child: Text('Eliminar',
                style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  // ===========================================================================
  // BUILD SCAFFOLD & SIDEBAR (Architecture)
  // ===========================================================================
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: scaffoldBg,
      body: Row(
        children: [
          // Menu Lateral (Flex: 2)
          Expanded(
            flex: 2,
            child: _buildSidebar(),
          ),

          // Área Central (Flex: 8) -> IndexedStack
          Expanded(
            flex: 8,
            child: IndexedStack(
              index: _selectedIndex,
              children: [
                // Index 0: O Dashboard
                _buildDashboardTab(),

                // Index 1: Eventos (CRUD List)
                _buildEventsTab(),

                // Index 2: Criar (Form)
                _buildCreateTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebar() {
    return Container(
      height: double.infinity,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          right: BorderSide(color: borderColor, width: 1.0),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Logo no topo
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6.0),
                  decoration: BoxDecoration(
                    color: neonOrange.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  child: const Icon(Icons.hub_rounded,
                      color: neonOrange, size: 20),
                ),
                const SizedBox(width: 10.0),
                Expanded(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'LOTUS PROMOTER',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: textDark,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8.0),

          // 3 ListTiles de Navegação
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14.0),
            child: Column(
              children: [
                _buildSidebarTile(
                  index: 0,
                  title: 'Dashboard',
                  icon: Icons.bar_chart_rounded,
                ),
                const SizedBox(height: 6.0),
                _buildSidebarTile(
                  index: 1,
                  title: 'Eventos',
                  icon: Icons.event_note_rounded,
                  badge: '${_myEvents.length}',
                ),
                const SizedBox(height: 6.0),
                _buildSidebarTile(
                  index: 2,
                  title: 'Criar',
                  icon: Icons.add_circle_outline_rounded,
                ),
              ],
            ),
          ),

          const Spacer(),

          // Quick Plan Status Pill in sidebar footer
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              padding: const EdgeInsets.all(14.0),
              decoration: BoxDecoration(
                color: _subscriptionTier == 'premium'
                    ? const Color(0xFFFEF3C7)
                    : const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(10.0),
                border: Border.all(
                  color: _subscriptionTier == 'premium'
                      ? const Color(0xFFF59E0B)
                      : borderColor,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    _subscriptionTier == 'premium'
                        ? Icons.workspace_premium_rounded
                        : Icons.shield_outlined,
                    color: _subscriptionTier == 'premium'
                        ? const Color(0xFFD97706)
                        : textMuted,
                    size: 18,
                  ),
                  const SizedBox(width: 8.0),
                  Expanded(
                    child: Text(
                      _subscriptionTier == 'premium'
                          ? 'PROMOTER PREMIUM'
                          : 'Plano Freemium (0/1)',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: _subscriptionTier == 'premium'
                            ? const Color(0xFF92400E)
                            : textDark,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebarTile({
    required int index,
    required String title,
    required IconData icon,
    String? badge,
  }) {
    final bool isSelected = _selectedIndex == index;

    return ListTile(
      dense: true,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10.0),
      ),
      tileColor: isSelected ? activeTileBg : Colors.transparent,
      leading: Icon(
        icon,
        color: isSelected ? neonOrange : textMuted,
        size: 20,
      ),
      title: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          color: isSelected ? neonOrange : textMuted,
        ),
      ),
      trailing: badge != null
          ? Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8.0, vertical: 2.0),
              decoration: BoxDecoration(
                color: isSelected
                    ? neonOrange.withValues(alpha: 0.15)
                    : const Color(0xFFE5E7EB),
                borderRadius: BorderRadius.circular(10.0),
              ),
              child: Text(
                badge,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? neonOrange : textMuted,
                ),
              ),
            )
          : null,
      onTap: () {
        setState(() {
          _selectedIndex = index;
        });
      },
    );
  }

  // ===========================================================================
  // TAB 0: O DASHBOARD (Métricas & Prova de Valor)
  // ===========================================================================
  Widget _buildDashboardTab() {
    final bool isPremium = _subscriptionTier == 'premium';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(40.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Card Plano (Topo)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24.0),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12.0),
              border: Border.all(color: borderColor, width: 1.0),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Esquerda: Texto do Plano
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Wrap(
                        crossAxisAlignment: WrapCrossAlignment.center,
                        spacing: 10.0,
                        runSpacing: 4.0,
                        children: [
                          Text(
                            isPremium
                                ? 'Plano Atual: PROMOTER PREMIUM'
                                : 'Plano Atual: Freemium',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: textDark,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8.0, vertical: 3.0),
                            decoration: BoxDecoration(
                              color: isPremium
                                  ? const Color(0xFF10B981)
                                      .withValues(alpha: 0.12)
                                  : neonOrange.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(6.0),
                            ),
                            child: Text(
                              isPremium ? 'ILIMITADO' : '1 / MÊS',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: isPremium
                                    ? const Color(0xFF10B981)
                                    : neonOrange,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6.0),
                      Text(
                        isPremium
                            ? 'Podes publicar eventos ilimitados e aceder a métricas de impacto no Porto.'
                            : '$_eventsPublishedThisMonth/1 eventos este mês',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16.0),

                // Direita: Botão Upgrade
                isPremium
                    ? OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(
                              color: Color(0xFF10B981), width: 1.5),
                          foregroundColor: const Color(0xFF10B981),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20.0, vertical: 12.0),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                        ),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: textDark,
                              content: Text(
                                'A tua subscrição Premium está ativa (5€/mês).',
                                style: GoogleFonts.inter(color: Colors.white),
                              ),
                            ),
                          );
                        },
                        icon: const Icon(Icons.check_circle_rounded,
                            color: Color(0xFF10B981), size: 16),
                        label: Text(
                          'Plano Ativo',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      )
                    : ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.orange,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24.0, vertical: 14.0),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                        ),
                        onPressed: _showUpgradeDialog,
                        child: Text(
                          'Upgrade',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
              ],
            ),
          ),

          const SizedBox(height: 40.0),

          // Título de Secção
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 12.0,
            runSpacing: 8.0,
            children: [
              Text(
                'Métricas de Impacto',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: textDark,
                ),
              ),
              Text(
                'Últimos 30 dias no Porto',
                style: GoogleFonts.inter(fontSize: 12, color: textMuted),
              ),
            ],
          ),
          const SizedBox(height: 16.0),

          // Grelha de Métricas (Wrap de 4 cartões de 220 x 120)
          Wrap(
            spacing: 20.0,
            runSpacing: 20.0,
            alignment: WrapAlignment.start,
            children: [
              _buildMetricCard(
                  'Total Eventos', '${_myEvents.length}', Icons.calendar_today_rounded),
              _buildMetricCard(
                  'Cliques no Mapa', '1.420', Icons.touch_app_rounded),
              _buildMetricCard(
                  'Pessoas no Radar', '850', Icons.radar_rounded),
              _buildMetricCard(
                  'Taxa de Conversão', '18.4%', Icons.trending_up_rounded),
            ],
          ),

          const SizedBox(height: 32.0),

          // Banner de Prova de Valor (SaaS Value Proposition)
          Container(
            padding: const EdgeInsets.all(22.0),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14.0),
              border: Border.all(color: borderColor, width: 1.0),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12.0),
                  decoration: BoxDecoration(
                    color: neonOrange.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                  child: const Icon(Icons.rocket_launch_rounded,
                      color: neonOrange, size: 28),
                ),
                const SizedBox(width: 18.0),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Porquê o Plano de 5€/mês?',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: textDark,
                        ),
                      ),
                      const SizedBox(height: 4.0),
                      Text(
                        'Os eventos com marcadores destacados geram em média 3.8x mais interações no mapa do Porto. Desbloqueia pins animados, alertas de proximidade e eventos ilimitados.',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: textMedium,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
                if (!isPremium) ...[
                  const SizedBox(width: 16.0),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: neonOrange,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 18.0, vertical: 12.0),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                    ),
                    onPressed: _showUpgradeDialog,
                    child: Text(
                      'Upgrade 5€',
                      style: GoogleFonts.inter(
                          fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Cartão 220 x 120 exato
  Widget _buildMetricCard(String titulo, String valor, IconData icone) {
    return Container(
      width: 220,
      height: 120,
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: borderColor, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Título cinza pequeno no topo à esquerda
          Align(
            alignment: Alignment.topLeft,
            child: Text(
              titulo,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: textMuted,
              ),
            ),
          ),

          // Ícone no topo à direita
          Align(
            alignment: Alignment.topRight,
            child: Icon(
              icone,
              color: neonOrange,
              size: 18,
            ),
          ),

          // Valor (gigante) centrado
          Center(
            child: Padding(
              padding: const EdgeInsets.only(top: 14.0),
              child: Text(
                valor,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: textDark,
                  letterSpacing: -0.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ===========================================================================
  // TAB 1: EVENTOS (CRUD List com Edit e Delete)
  // ===========================================================================
  Widget _buildEventsTab() {
    if (_myEvents.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20.0),
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.event_busy_rounded,
                  size: 48, color: textMuted),
            ),
            const SizedBox(height: 16.0),
            Text(
              'Ainda não tens nenhum evento publicado',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: textDark,
              ),
            ),
            const SizedBox(height: 6.0),
            Text(
              'Cria o teu primeiro evento para começar a divulgar no Porto.',
              style: GoogleFonts.inter(fontSize: 13, color: textMuted),
            ),
            const SizedBox(height: 20.0),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: neonOrange,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                    horizontal: 20.0, vertical: 12.0),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0)),
              ),
              onPressed: () {
                setState(() => _selectedIndex = 2);
              },
              icon: const Icon(Icons.add_rounded, size: 18),
              label: Text('Criar Primeiro Evento',
                  style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(40.0),
      itemCount: _myEvents.length,
      itemBuilder: (context, index) {
        final event = _myEvents[index];

        return Container(
          margin: const EdgeInsets.only(bottom: 14.0),
          padding: const EdgeInsets.all(18.0),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12.0),
            border: Border.all(color: borderColor, width: 1.0),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Poster do Evento
              ClipRRect(
                borderRadius: BorderRadius.circular(8.0),
                child: Image.network(
                  event.image,
                  width: 72,
                  height: 72,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    width: 72,
                    height: 72,
                    color: const Color(0xFFF3F4F6),
                    child: const Icon(Icons.image_not_supported_rounded,
                        color: textMuted),
                  ),
                ),
              ),
              const SizedBox(width: 18.0),

              // Informações do Evento
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      spacing: 8.0,
                      runSpacing: 4.0,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8.0, vertical: 2.0),
                          decoration: BoxDecoration(
                            color: neonOrange.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(4.0),
                          ),
                          child: Text(
                            event.category.toUpperCase(),
                            style: GoogleFonts.inter(
                              color: neonOrange,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Text(
                          _formatDateTime(event.dateTime),
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: textMuted,
                          ),
                        ),
                        Text(
                          event.isFree
                              ? 'Gratuito'
                              : '${event.priceMin.toStringAsFixed(2)} €',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: textDark,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6.0),
                    Text(
                      event.title,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: textDark,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4.0),
                    Row(
                      children: [
                        const Icon(Icons.place_outlined,
                            size: 14, color: textMuted),
                        const SizedBox(width: 4.0),
                        Expanded(
                          child: Text(
                            event.locationName,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: textMuted,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Botões de Ação CRUD (Editar e Apagar)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: const Icon(Icons.edit_outlined,
                        color: textMedium, size: 20),
                    tooltip: 'Editar evento',
                    onPressed: () => _showEditEventDialog(event),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline_rounded,
                        color: Color(0xFFEF4444), size: 20),
                    tooltip: 'Eliminar evento',
                    onPressed: () => _confirmDeleteEvent(event),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  // ===========================================================================
  // TAB 2: CRIAR (Formulário Limpo com Bloqueio Freemium)
  // ===========================================================================
  Widget _buildCreateTab() {
    final bool isBlocked = _isQuotaExhausted;

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(40.0),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 580),
          child: Container(
            padding: const EdgeInsets.all(32.0),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16.0),
              border: Border.all(color: borderColor, width: 1.0),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Form(
              key: _createFormKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Criar Novo Evento',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: textDark,
                        ),
                      ),
                      if (isBlocked)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10.0, vertical: 4.0),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEF4444)
                                .withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(6.0),
                          ),
                          child: Text(
                            'Quota Esgotada',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFFEF4444),
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 6.0),
                  Text(
                    'Preenche os detalhes para lançar o teu evento no radar do Porto.',
                    style: GoogleFonts.inter(fontSize: 13, color: textMuted),
                  ),
                  const SizedBox(height: 24.0),

                  // 1. Título
                  Text('Título do Evento *',
                      style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: textDark)),
                  const SizedBox(height: 6.0),
                  TextFormField(
                    controller: _titleController,
                    style: GoogleFonts.inter(color: textDark, fontSize: 14),
                    decoration:
                        _inputDecoration('Ex: Sunset na Ribeira & Live Set'),
                    validator: (v) => (v == null || v.trim().isEmpty)
                        ? 'O título é obrigatório.'
                        : null,
                  ),
                  const SizedBox(height: 18.0),

                  // 2. Categoria & Preço
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Categoria *',
                                style: GoogleFonts.inter(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: textDark)),
                            const SizedBox(height: 6.0),
                            DropdownButtonFormField<String>(
                              initialValue: _selectedCategory,
                              decoration: _inputDecoration(''),
                              items: const [
                                DropdownMenuItem(
                                    value: 'Música', child: Text('Música')),
                                DropdownMenuItem(
                                    value: 'Social', child: Text('Social')),
                                DropdownMenuItem(
                                    value: 'Arte', child: Text('Arte')),
                                DropdownMenuItem(
                                    value: 'Drop', child: Text('Drop')),
                              ],
                              onChanged: (val) {
                                if (val != null) {
                                  setState(() => _selectedCategory = val);
                                }
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 14.0),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Preço (€)',
                                style: GoogleFonts.inter(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: textDark)),
                            const SizedBox(height: 6.0),
                            TextFormField(
                              controller: _priceController,
                              keyboardType: TextInputType.number,
                              enabled: !_isFree,
                              style: GoogleFonts.inter(
                                  color: textDark, fontSize: 14),
                              decoration: _inputDecoration(
                                  _isFree ? 'Gratuito' : '0.00'),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10.0),
                  Row(
                    children: [
                      Switch(
                        value: _isFree,
                        activeThumbColor: neonOrange,
                        onChanged: (val) {
                          setState(() {
                            _isFree = val;
                            if (val) _priceController.text = '0.00';
                          });
                        },
                      ),
                      const SizedBox(width: 8.0),
                      Expanded(
                        child: Text(
                          'Evento com entrada livre (Gratuito)',
                          style: GoogleFonts.inter(
                              fontSize: 13, color: textMedium),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18.0),

                  // 3. Data & Hora Pickers
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Data *',
                                style: GoogleFonts.inter(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: textDark)),
                            const SizedBox(height: 6.0),
                            InkWell(
                              onTap: () async {
                                final picked = await showDatePicker(
                                  context: context,
                                  initialDate: _selectedDate,
                                  firstDate: DateTime.now(),
                                  lastDate: DateTime.now()
                                      .add(const Duration(days: 90)),
                                );
                                if (picked != null) {
                                  setState(() => _selectedDate = picked);
                                }
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 14.0, vertical: 12.0),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(8.0),
                                  border: Border.all(color: borderColor),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.calendar_today_rounded,
                                        size: 16, color: neonOrange),
                                    const SizedBox(width: 8.0),
                                    Text(
                                      DateFormat('d MMM yyyy')
                                          .format(_selectedDate),
                                      style: GoogleFonts.inter(
                                          color: textDark, fontSize: 13),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 14.0),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Hora *',
                                style: GoogleFonts.inter(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: textDark)),
                            const SizedBox(height: 6.0),
                            InkWell(
                              onTap: () async {
                                final picked = await showTimePicker(
                                  context: context,
                                  initialTime: _selectedTime,
                                );
                                if (picked != null) {
                                  setState(() => _selectedTime = picked);
                                }
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 14.0, vertical: 12.0),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(8.0),
                                  border: Border.all(color: borderColor),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.access_time_rounded,
                                        size: 16, color: neonOrange),
                                    const SizedBox(width: 8.0),
                                    Text(
                                      _selectedTime.format(context),
                                      style: GoogleFonts.inter(
                                          color: textDark, fontSize: 13),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18.0),

                  // 4. Localização no Mapa
                  Text('Localização no Porto *',
                      style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: textDark)),
                  const SizedBox(height: 6.0),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _locationNameController,
                          style:
                              GoogleFonts.inter(color: textDark, fontSize: 14),
                          decoration:
                              _inputDecoration('Ex: Plano B, Baixa do Porto'),
                          validator: (v) => (v == null || v.trim().isEmpty)
                              ? 'Indica o local.'
                              : null,
                        ),
                      ),
                      const SizedBox(width: 10.0),
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: neonOrange),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14.0, vertical: 13.0),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8.0)),
                        ),
                        onPressed: () {
                          // Quick venue picker for Porto
                          showModalBottomSheet(
                            context: context,
                            shape: const RoundedRectangleBorder(
                              borderRadius: BorderRadius.vertical(
                                  top: Radius.circular(16)),
                            ),
                            builder: (ctx) => Padding(
                              padding: const EdgeInsets.all(20.0),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Locais Populares no Porto',
                                    style: GoogleFonts.plusJakartaSans(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                      color: textDark,
                                    ),
                                  ),
                                  const SizedBox(height: 10.0),
                                  _portoVenueTile('Plano B',
                                      'Rua Cândido dos Reis 30, Porto', 41.1470, -8.6145),
                                  _portoVenueTile('Hard Club',
                                      'Praça do Infante D. Henrique, Porto', 41.1412, -8.6148),
                                  _portoVenueTile('Jardim do Morro',
                                      'Av. da República, Gaia', 41.1405, -8.6095),
                                  _portoVenueTile('Casa da Música',
                                      'Avenida da Boavista 604, Porto', 41.1589, -8.6308),
                                  _portoVenueTile('Maus Hábitos',
                                      'Rua de Passos Manuel 178, Porto', 41.1469, -8.6068),
                                ],
                              ),
                            ),
                          );
                        },
                        icon: const Icon(Icons.place_rounded,
                            size: 16, color: neonOrange),
                        label: Text('Mapa',
                            style: GoogleFonts.inter(
                                color: neonOrange, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18.0),

                  // 5. Póster (Imagem)
                  Text('Póster do Evento',
                      style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: textDark)),
                  const SizedBox(height: 8.0),
                  SizedBox(
                    height: 60,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _samplePosters.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 10),
                      itemBuilder: (context, i) {
                        final url = _samplePosters[i];
                        final isSelected = _selectedPosterUrl == url;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedPosterUrl = url),
                          child: Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: isSelected ? neonOrange : borderColor,
                                width: isSelected ? 2.5 : 1.0,
                              ),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: Image.network(url, fit: BoxFit.cover),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 30.0),

                  // 6. Botão de Submissão com Validação de Quota
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isBlocked
                            ? const Color(0xFF9CA3AF)
                            : neonOrange,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                      ),
                      onPressed: isBlocked ? _showUpgradeDialog : _submitCreateEvent,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            isBlocked
                                ? Icons.lock_rounded
                                : Icons.rocket_launch_rounded,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            isBlocked
                                ? 'Atingiste o limite. Faz Upgrade'
                                : 'Publicar Evento',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _portoVenueTile(String name, String address, double lat, double lng) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const Icon(Icons.location_on, color: neonOrange),
      title: Text(name,
          style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 14)),
      subtitle: Text(address,
          style: GoogleFonts.inter(fontSize: 12, color: textMuted)),
      onTap: () {
        setState(() {
          _locationNameController.text = name;
          _locationAddressController.text = address;
          _latitude = lat;
          _longitude = lng;
        });
        Navigator.pop(context);
      },
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(color: const Color(0xFF9CA3AF), fontSize: 13),
      filled: true,
      fillColor: Colors.white,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8.0),
        borderSide: const BorderSide(color: borderColor, width: 1.0),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8.0),
        borderSide: const BorderSide(color: neonOrange, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8.0),
        borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1.0),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8.0),
        borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1.5),
      ),
    );
  }
}
