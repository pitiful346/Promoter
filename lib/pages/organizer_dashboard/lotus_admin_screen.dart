import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'promoter_dashboard_status.dart';

/// Professional B2B Promoter Admin Screen with Dark Theme,
/// divided into 3 main tabs:
/// 1. Dashboard (Overview & B2B Metrics)
/// 2. My Events (ListView with edit/delete actions & empty state)
/// 3. Create Event (Clean form with Freemium quota lock enforcement)
class LotusAdminScreen extends StatefulWidget {
  const LotusAdminScreen({super.key});

  static String routeName = 'LotusAdmin';
  static String routePath = '/lotusAdmin';

  @override
  State<LotusAdminScreen> createState() => _LotusAdminScreenState();
}

class _LotusAdminScreenState extends State<LotusAdminScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Local state for mock events displayed in the promoter dashboard
  List<DevelopmentEvent> _promoterEvents = [];
  bool _isLoading = true;

  // Local subscription simulation (defaults to user's real or mock data)
  String _currentTier = 'free';
  int _eventsPublishedThisMonth = 0;
  bool _isPromoter = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _initializePromoterData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _initializePromoterData() {
    // Read from currentUserDocument if available, otherwise use sensible promoter defaults
    final user = currentUserDocument;
    if (user != null) {
      _currentTier = user.subscriptionTier.isNotEmpty ? user.subscriptionTier : 'free';
      _eventsPublishedThisMonth = user.eventsPublishedThisMonth;
      _isPromoter = user.isPromoter;
    } else {
      _currentTier = 'free';
      _eventsPublishedThisMonth = 0;
      _isPromoter = true;
    }

    // Load initial events from DevelopmentMapEventRepository (take first 4 as promoter's own events)
    final repoEvents = DevelopmentMapEventRepository.instance.currentEvents;
    if (repoEvents.isNotEmpty) {
      _promoterEvents = repoEvents.take(4).toList();
    } else {
      _promoterEvents = generateMockEvents().take(4).toList();
    }

    setState(() {
      _isLoading = false;
    });
  }

  PromoterDashboardStatus get _status => PromoterDashboardStatus(
        tier: _currentTier,
        eventsPublishedThisMonth: _eventsPublishedThisMonth,
        isPromoter: _isPromoter,
      );

  void _onEventCreated(DevelopmentEvent newEvent) {
    setState(() {
      _promoterEvents.insert(0, newEvent);
      if (_status.isFree) {
        _eventsPublishedThisMonth += 1;
      }
    });

    // Also add to global dev repository so map and lists update
    DevelopmentMapEventRepository.instance.addEvent(newEvent);

    // Switch to 'Os Meus Eventos' tab
    _tabController.animateTo(1);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF10B981),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Evento "${newEvent.title}" publicado com sucesso!',
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _deleteEvent(DevelopmentEvent event) {
    setState(() {
      _promoterEvents.removeWhere((e) => e.id == event.id);
    });
    DevelopmentMapEventRepository.instance.deleteEvent(event.id);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF27272A),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        content: Text(
          'Evento "${event.title}" removido.',
          style: GoogleFonts.inter(color: Colors.white),
        ),
      ),
    );
  }

  void _showUpgradeDialog() {
    showDialog(
      context: context,
      builder: (ctx) => UpgradePlanDialog(
        currentTier: _currentTier,
        onUpgradeSuccess: () {
          setState(() {
            _currentTier = 'premium';
          });
          Navigator.of(ctx).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: const Color(0xFFFF6B00),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              content: Row(
                children: [
                  const Icon(Icons.workspace_premium_rounded, color: Colors.white),
                  const SizedBox(width: 12),
                  Text(
                    'Parabéns! Fizeste upgrade para o plano PROMOTER PREMIUM!',
                    style: GoogleFonts.inter(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = FlutterFlowTheme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF121215),
        elevation: 0,
        titleSpacing: 20,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFA855F7).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: const Color(0xFFA855F7).withValues(alpha: 0.3),
                ),
              ),
              child: const Icon(
                Icons.hub_rounded,
                color: Color(0xFFA855F7),
                size: 22,
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'LOTUS PROMOTER',
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
                Text(
                  'Portal B2B de Gestão de Eventos',
                  style: GoogleFonts.inter(
                    color: const Color(0xFFA1A1AA),
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Quick upgrade / tier pill
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: _status.isUnlimited
                ? Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFF7A00), Color(0xFFFFB800)],
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFFF7A00).withValues(alpha: 0.4),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.workspace_premium_rounded,
                            color: Colors.white, size: 16),
                        const SizedBox(width: 6),
                        Text(
                          'PREMIUM',
                          style: GoogleFonts.inter(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ],
                    ),
                  )
                : OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFFF7A00), width: 1.5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    ),
                    onPressed: _showUpgradeDialog,
                    icon: const Icon(Icons.bolt_rounded,
                        color: Color(0xFFFF7A00), size: 16),
                    label: Text(
                      'Upgrade 5€/mês',
                      style: GoogleFonts.inter(
                        color: const Color(0xFFFF7A00),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Container(
            decoration: const BoxDecoration(
              color: Color(0xFF121215),
              border: Border(
                bottom: BorderSide(color: Color(0xFF27272A), width: 1),
              ),
            ),
            child: TabBar(
              controller: _tabController,
              indicatorColor: const Color(0xFFA855F7),
              indicatorWeight: 3,
              labelColor: const Color(0xFFA855F7),
              unselectedLabelColor: const Color(0xFFA1A1AA),
              labelStyle: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
              unselectedLabelStyle: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.w500,
                fontSize: 13,
              ),
              tabs: const [
                Tab(
                  icon: Icon(Icons.dashboard_rounded, size: 18),
                  text: 'Dashboard',
                ),
                Tab(
                  icon: Icon(Icons.event_note_rounded, size: 18),
                  text: 'Os Meus Eventos',
                ),
                Tab(
                  icon: Icon(Icons.add_circle_outline_rounded, size: 18),
                  text: 'Criar Evento',
                ),
              ],
            ),
          ),
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFA855F7)),
              ),
            )
          : TabBarView(
              controller: _tabController,
              children: [
                // TAB 1: Dashboard (Visão Geral e Métricas)
                _buildDashboardTab(theme),

                // TAB 2: Os Meus Eventos (Lista de Cartões e Empty State)
                _buildMyEventsTab(theme),

                // TAB 3: Criar Evento (Formulário Limpo com Bloqueio Freemium)
                _buildCreateEventTab(theme),
              ],
            ),
    );
  }

  // ===========================================================================
  // TAB 1: DASHBOARD (Visão Geral e Métricas)
  // ===========================================================================
  Widget _buildDashboardTab(FlutterFlowTheme theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section: Status Card do Plano
          PlanStatusCard(
            status: _status,
            onUpgradePressed: _showUpgradeDialog,
            onCreateEventPressed: () {
              if (_status.canCreateEvent) {
                _tabController.animateTo(2);
              } else {
                _showUpgradeDialog();
              }
            },
          ),
          const SizedBox(height: 28),

          // Section Title: Métricas B2B
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Métricas de Desempenho',
                style: GoogleFonts.plusJakartaSans(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_month_rounded,
                        color: Color(0xFFA1A1AA), size: 13),
                    const SizedBox(width: 6),
                    Text(
                      'Últimos 30 dias',
                      style: GoogleFonts.inter(
                        color: const Color(0xFFA1A1AA),
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Grid / Wrap com 3 Cartões de Estatísticas
          LayoutBuilder(
            builder: (context, constraints) {
              final isDesktop = constraints.maxWidth > 700;
              final cardWidth = isDesktop
                  ? (constraints.maxWidth - 32) / 3
                  : constraints.maxWidth;

              final metric1 = MetricCard(
                title: 'Total de Eventos',
                value: '${_promoterEvents.length}',
                trend: '+12% este mês',
                isPositiveTrend: true,
                icon: Icons.calendar_today_rounded,
                accentColor: const Color(0xFFA855F7),
                width: cardWidth,
              );

              final metric2 = MetricCard(
                title: 'Cliques no Mapa',
                value: '3.840',
                trend: '+28% vs. semana passada',
                isPositiveTrend: true,
                icon: Icons.touch_app_rounded,
                accentColor: const Color(0xFF00F2FF),
                width: cardWidth,
              );

              final metric3 = MetricCard(
                title: 'Pessoas no Radar',
                value: '1.250',
                trend: '+45% alcance local',
                isPositiveTrend: true,
                icon: Icons.radar_rounded,
                accentColor: const Color(0xFFFF7A00),
                width: cardWidth,
              );

              if (isDesktop) {
                return Row(
                  children: [
                    Expanded(child: metric1),
                    const SizedBox(width: 16),
                    Expanded(child: metric2),
                    const SizedBox(width: 16),
                    Expanded(child: metric3),
                  ],
                );
              }

              return Column(
                children: [
                  metric1,
                  const SizedBox(height: 12),
                  metric2,
                  const SizedBox(height: 12),
                  metric3,
                ],
              );
            },
          ),
          const SizedBox(height: 28),

          // Quick Action Banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF18181B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF27272A)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFA855F7).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.insights_rounded,
                    color: Color(0xFFA855F7),
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Dica de Engajamento no Porto',
                        style: GoogleFonts.plusJakartaSans(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Eventos com marcadores nas zonas da Ribeira e Baixa registam 3.4x mais conversão nas noites de Quinta a Sábado.',
                        style: GoogleFonts.inter(
                          color: const Color(0xFFA1A1AA),
                          fontSize: 12,
                          height: 1.4,
                        ),
                      ),
                    ],
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
  // TAB 2: OS MEUS EVENTOS (ListView e Empty State)
  // ===========================================================================
  Widget _buildMyEventsTab(FlutterFlowTheme theme) {
    if (_promoterEvents.isEmpty) {
      return EmptyEventsState(
        onCreatePressed: () {
          if (_status.canCreateEvent) {
            _tabController.animateTo(2);
          } else {
            _showUpgradeDialog();
          }
        },
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      itemCount: _promoterEvents.length,
      separatorBuilder: (_, __) => const SizedBox(height: 14),
      itemBuilder: (context, index) {
        final event = _promoterEvents[index];
        return PromoterEventCard(
          event: event,
          onEdit: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                backgroundColor: const Color(0xFF27272A),
                content: Text(
                  'A editar "${event.title}"...',
                  style: GoogleFonts.inter(color: Colors.white),
                ),
              ),
            );
          },
          onDelete: () => _deleteEvent(event),
        );
      },
    );
  }

  // ===========================================================================
  // TAB 3: CRIAR EVENTO (Formulário com Validação Freemium)
  // ===========================================================================
  Widget _buildCreateEventTab(FlutterFlowTheme theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 640),
          child: CreateEventForm(
            status: _status,
            onEventCreated: _onEventCreated,
            onUpgradeRequested: _showUpgradeDialog,
          ),
        ),
      ),
    );
  }
}

// =============================================================================
// SUB-WIDGET: PlanStatusCard
// =============================================================================
class PlanStatusCard extends StatelessWidget {
  final PromoterDashboardStatus status;
  final VoidCallback onUpgradePressed;
  final VoidCallback onCreateEventPressed;

  const PlanStatusCard({
    super.key,
    required this.status,
    required this.onUpgradePressed,
    required this.onCreateEventPressed,
  });

  @override
  Widget build(BuildContext context) {
    if (status.isUnlimited) {
      // PREMIUM / FOUNDER CARD
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          color: const Color(0xFF18181B),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: const Color(0xFFFF7A00).withValues(alpha: 0.5),
            width: 1.5,
          ),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              const Color(0xFF1F1F24),
              const Color(0xFFFF7A00).withValues(alpha: 0.08),
            ],
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFFF7A00).withValues(alpha: 0.15),
              blurRadius: 20,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Gold / Neon Orange Badge
                Flexible(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFF7A00), Color(0xFFFFB800)],
                      ),
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFFF7A00).withValues(alpha: 0.4),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.workspace_premium_rounded,
                            color: Colors.white, size: 18),
                        const SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            status.badgeText,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.plusJakartaSans(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.all_inclusive_rounded,
                          color: Color(0xFF10B981), size: 14),
                      const SizedBox(width: 4),
                      Text(
                        'Eventos Ilimitados',
                        style: GoogleFonts.inter(
                          color: const Color(0xFF10B981),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Acesso Ilimitado de Promotor Ativo',
              style: GoogleFonts.plusJakartaSans(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Podes publicar eventos ilimitados com visibilidade máxima no mapa do Porto.',
              style: GoogleFonts.inter(
                color: const Color(0xFFA1A1AA),
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 18),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFA855F7),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              ),
              onPressed: onCreateEventPressed,
              icon: const Icon(Icons.add_rounded, size: 18),
              label: Text(
                'Criar Novo Evento',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
      );
    }

    // FREE TIER CARD
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B), // Dark grey card
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF27272A),
          width: 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF27272A),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.shield_outlined,
                        color: Color(0xFFA1A1AA),
                        size: 16,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Plano Gratuito (Freemium)',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.plusJakartaSans(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: status.isQuotaExhausted
                      ? const Color(0xFFEF4444).withValues(alpha: 0.15)
                      : const Color(0xFF10B981).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  status.isQuotaExhausted ? 'Quota Esgotada' : '1 Evento / Mês',
                  style: GoogleFonts.inter(
                    color: status.isQuotaExhausted
                        ? const Color(0xFFEF4444)
                        : const Color(0xFF10B981),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Progress Bar: Eventos publicados este mês
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Eventos publicados este mês:',
                style: GoogleFonts.inter(
                  color: const Color(0xFFA1A1AA),
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                status.quotaDisplayText,
                style: GoogleFonts.plusJakartaSans(
                  color: status.isQuotaExhausted
                      ? const Color(0xFFFF7A00)
                      : Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: status.progressRatio,
              minHeight: 8,
              backgroundColor: const Color(0xFF27272A),
              valueColor: AlwaysStoppedAnimation<Color>(
                status.isQuotaExhausted
                    ? const Color(0xFFFF7A00)
                    : const Color(0xFFA855F7),
              ),
            ),
          ),
          const SizedBox(height: 18),

          // Action Buttons: Upgrade & Create
          Wrap(
            spacing: 12,
            runSpacing: 10,
            children: [
              // Highlight upgrade button: Neon Orange
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFF7A00),
                  foregroundColor: Colors.white,
                  elevation: 4,
                  shadowColor: const Color(0xFFFF7A00).withValues(alpha: 0.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 12,
                  ),
                ),
                onPressed: onUpgradePressed,
                icon: const Icon(Icons.bolt_rounded, size: 18),
                label: Text(
                  'Fazer Upgrade para Ilimitado (5€/mês)',
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ),

              // Create event button (disabled if quota exhausted)
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: status.canCreateEvent
                      ? const Color(0xFFA855F7)
                      : const Color(0xFF27272A),
                  foregroundColor: status.canCreateEvent
                      ? Colors.white
                      : const Color(0xFF71717A),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                ),
                onPressed: status.canCreateEvent ? onCreateEventPressed : null,
                icon: Icon(
                  status.canCreateEvent ? Icons.add_rounded : Icons.lock_rounded,
                  size: 16,
                ),
                label: Text(
                  status.canCreateEvent ? 'Novo Evento' : 'Limite Atingido',
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// =============================================================================
// SUB-WIDGET: MetricCard
// =============================================================================
class MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final String trend;
  final bool isPositiveTrend;
  final IconData icon;
  final Color accentColor;
  final double? width;

  const MetricCard({
    super.key,
    required this.title,
    required this.value,
    required this.trend,
    required this.isPositiveTrend,
    required this.icon,
    required this.accentColor,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    color: const Color(0xFFA1A1AA),
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: accentColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: accentColor, size: 18),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontSize: 26,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(
                isPositiveTrend
                    ? Icons.arrow_upward_rounded
                    : Icons.arrow_downward_rounded,
                color: isPositiveTrend
                    ? const Color(0xFF10B981)
                    : const Color(0xFFEF4444),
                size: 14,
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  trend,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    color: isPositiveTrend
                        ? const Color(0xFF10B981)
                        : const Color(0xFFEF4444),
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// =============================================================================
// SUB-WIDGET: PromoterEventCard
// =============================================================================
class PromoterEventCard extends StatelessWidget {
  final DevelopmentEvent event;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const PromoterEventCard({
    super.key,
    required this.event,
    required this.onEdit,
    required this.onDelete,
  });

  Color _categoryColor(String cat) {
    switch (cat.toLowerCase()) {
      case 'música':
        return const Color(0xFFA855F7);
      case 'social':
        return const Color(0xFF00F2FF);
      case 'arte':
        return const Color(0xFF10B981);
      case 'drop':
        return const Color(0xFFFF7A00);
      default:
        return const Color(0xFFA855F7);
    }
  }

  @override
  Widget build(BuildContext context) {
    final catColor = _categoryColor(event.category);
    String dateStr;
    try {
      dateStr = DateFormat('EEE, d MMM • HH:mm', 'pt_PT').format(event.dateTime);
    } catch (_) {
      dateStr = DateFormat('EEE, d MMM • HH:mm').format(event.dateTime);
    }

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Event Poster / Thumbnail
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                event.image,
                width: 80,
                height: 80,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  width: 80,
                  height: 80,
                  color: const Color(0xFF27272A),
                  child: const Icon(Icons.image_not_supported_rounded,
                      color: Color(0xFF71717A)),
                ),
              ),
            ),
            const SizedBox(width: 16),

            // Info Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: catColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          event.category.toUpperCase(),
                          style: GoogleFonts.inter(
                            color: catColor,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        event.isFree ? 'Gratuito' : '${event.priceMin.toStringAsFixed(2)} €',
                        style: GoogleFonts.inter(
                          color: const Color(0xFFA1A1AA),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    event.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.plusJakartaSans(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.access_time_rounded,
                          color: Color(0xFFA1A1AA), size: 13),
                      const SizedBox(width: 4),
                      Text(
                        dateStr,
                        style: GoogleFonts.inter(
                          color: const Color(0xFFA1A1AA),
                          fontSize: 11,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Icon(Icons.location_on_outlined,
                          color: Color(0xFFA1A1AA), size: 13),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          event.locationName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            color: const Color(0xFFA1A1AA),
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // PopupMenuButton com 'Editar' e 'Apagar'
            PopupMenuButton<String>(
              color: const Color(0xFF27272A),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              icon: const Icon(Icons.more_vert_rounded, color: Color(0xFFA1A1AA)),
              onSelected: (action) {
                if (action == 'edit') {
                  onEdit();
                } else if (action == 'delete') {
                  onDelete();
                }
              },
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 'edit',
                  child: Row(
                    children: [
                      const Icon(Icons.edit_rounded, color: Colors.white, size: 16),
                      const SizedBox(width: 10),
                      Text('Editar', style: GoogleFonts.inter(color: Colors.white)),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'delete',
                  child: Row(
                    children: [
                      const Icon(Icons.delete_outline_rounded,
                          color: Color(0xFFEF4444), size: 16),
                      const SizedBox(width: 10),
                      Text('Apagar',
                          style: GoogleFonts.inter(color: const Color(0xFFEF4444))),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// =============================================================================
// SUB-WIDGET: EmptyEventsState
// =============================================================================
class EmptyEventsState extends StatelessWidget {
  final VoidCallback onCreatePressed;

  const EmptyEventsState({super.key, required this.onCreatePressed});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                color: const Color(0xFF18181B),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF27272A), width: 2),
              ),
              child: const Icon(
                Icons.event_busy_rounded,
                color: Color(0xFFA855F7),
                size: 40,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Ainda não tens nenhum evento',
              style: GoogleFonts.plusJakartaSans(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Começa a divulgar eventos e drops na zona do Porto para milhares de participantes.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                color: const Color(0xFFA1A1AA),
                fontSize: 13,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFA855F7),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                elevation: 4,
              ),
              onPressed: onCreatePressed,
              icon: const Icon(Icons.add_rounded, size: 20),
              label: Text(
                '+ Criar Primeiro Evento',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// =============================================================================
// SUB-WIDGET: CreateEventForm (Com Bloqueio Freemium)
// =============================================================================
class CreateEventForm extends StatefulWidget {
  final PromoterDashboardStatus status;
  final ValueChanged<DevelopmentEvent> onEventCreated;
  final VoidCallback onUpgradeRequested;

  const CreateEventForm({
    super.key,
    required this.status,
    required this.onEventCreated,
    required this.onUpgradeRequested,
  });

  @override
  State<CreateEventForm> createState() => _CreateEventFormState();
}

class _CreateEventFormState extends State<CreateEventForm> {
  final _formKey = GlobalKey<FormState>();

  final _titleController = TextEditingController();
  final _locationNameController = TextEditingController(text: 'Plano B');
  final _addressController =
      TextEditingController(text: 'Rua Cândido dos Reis 30, 4050-151 Porto');
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController(text: '0.00');

  String _selectedCategory = 'Música';
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 2));
  TimeOfDay _selectedTime = const TimeOfDay(hour: 22, minute: 0);
  bool _isFree = true;
  double _latitude = 41.1470;
  double _longitude = -8.6145;

  @override
  void dispose() {
    _titleController.dispose();
    _locationNameController.dispose();
    _addressController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  InputDecoration _inputDecoration(String hint, {Widget? prefixIcon, Widget? suffixIcon}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(color: const Color(0xFF71717A), fontSize: 13),
      filled: true,
      fillColor: const Color(0xFF18181B),
      prefixIcon: prefixIcon,
      suffixIcon: suffixIcon,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.white24, width: 1.0),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFA855F7), width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1.0),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1.5),
      ),
    );
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
      builder: (context, child) => Theme(
        data: ThemeData.dark().copyWith(
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFFA855F7),
            onPrimary: Colors.white,
            surface: Color(0xFF18181B),
            onSurface: Colors.white,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
      builder: (context, child) => Theme(
        data: ThemeData.dark().copyWith(
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFFA855F7),
            onPrimary: Colors.white,
            surface: Color(0xFF18181B),
            onSurface: Colors.white,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() {
        _selectedTime = picked;
      });
    }
  }

  void _chooseLocationOnMap() {
    // Quick Porto locations picker
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF18181B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Escolher Local no Mapa do Porto',
              style: GoogleFonts.plusJakartaSans(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            _locationItem(
              'Plano B',
              'Rua Cândido dos Reis 30, 4050-151 Porto',
              41.1470,
              -8.6145,
            ),
            _locationItem(
              'Hard Club',
              'Praça do Infante D. Henrique, 4050-252 Porto',
              41.1412,
              -8.6148,
            ),
            _locationItem(
              'Jardim do Morro',
              'Av. da República, 4430-148 Vila Nova de Gaia',
              41.1405,
              -8.6095,
            ),
            _locationItem(
              'Casa da Música',
              'Avenida da Boavista 604-610, 4149-071 Porto',
              41.1589,
              -8.6308,
            ),
            _locationItem(
              'Maus Hábitos',
              'Rua de Passos Manuel 178, 4000-382 Porto',
              41.1469,
              -8.6068,
            ),
          ],
        ),
      ),
    );
  }

  Widget _locationItem(String name, String address, double lat, double lng) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const Icon(Icons.place_rounded, color: Color(0xFFA855F7)),
      title: Text(name, style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold)),
      subtitle: Text(address, style: GoogleFonts.inter(color: const Color(0xFFA1A1AA), fontSize: 11)),
      onTap: () {
        setState(() {
          _locationNameController.text = name;
          _addressController.text = address;
          _latitude = lat;
          _longitude = lng;
        });
        Navigator.pop(context);
      },
    );
  }

  void _submitForm() {
    // 1. Freemium quota lock enforcement:
    // Se subscription_tier == 'free' E events_published_this_month >= 1: bloqueia a ação
    if (widget.status.isQuotaExhausted) {
      widget.onUpgradeRequested();
      return;
    }

    if (!_formKey.currentState!.validate()) {
      return;
    }

    final eventDateTime = DateTime(
      _selectedDate.year,
      _selectedDate.month,
      _selectedDate.day,
      _selectedTime.hour,
      _selectedTime.minute,
    );

    final newEvent = DevelopmentEvent(
      id: 'event_${DateTime.now().millisecondsSinceEpoch}',
      title: _titleController.text.trim(),
      category: _selectedCategory,
      dateTime: eventDateTime,
      endDate: eventDateTime.add(const Duration(hours: 4)),
      locationName: _locationNameController.text.trim(),
      locationAddress: _addressController.text.trim(),
      latitude: _latitude,
      longitude: _longitude,
      distance: '500 m',
      distanceKm: 0.5,
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1080&auto=format&fit=crop&q=80',
      priceMin: _isFree ? 0.0 : (double.tryParse(_priceController.text) ?? 10.0),
      isFree: _isFree,
      ticketStatus: 'AVAILABLE',
      description: _descriptionController.text.isNotEmpty
          ? _descriptionController.text.trim()
          : 'Evento organizado no Porto com confirmação direta na app.',
      clickCount: 1,
      isBoosted: widget.status.isUnlimited,
    );

    widget.onEventCreated(newEvent);

    // Reset fields
    _titleController.clear();
    _descriptionController.clear();
  }

  @override
  Widget build(BuildContext context) {
    final isLocked = widget.status.isQuotaExhausted;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF121215),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.add_circle_outline_rounded,
                    color: Color(0xFFA855F7), size: 24),
                const SizedBox(width: 10),
                Text(
                  'Criar Novo Evento',
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Preenche os detalhes para publicar e divulgar o evento no mapa do Porto.',
              style: GoogleFonts.inter(
                color: const Color(0xFFA1A1AA),
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 24),

            // Título do Evento
            Text(
              'Título do Evento *',
              style: GoogleFonts.inter(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _titleController,
              style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
              decoration: _inputDecoration(
                'Ex: Sunset Ribeira, Techno na Baixa...',
                prefixIcon: const Icon(Icons.title_rounded,
                    color: Color(0xFFA1A1AA), size: 18),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'O título é obrigatório.';
                }
                return null;
              },
            ),
            const SizedBox(height: 18),

            // Categoria (DropdownButtonFormField)
            Text(
              'Categoria *',
              style: GoogleFonts.inter(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              initialValue: _selectedCategory,
              dropdownColor: const Color(0xFF18181B),
              style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
              decoration: _inputDecoration('',
                  prefixIcon: const Icon(Icons.category_outlined,
                      color: Color(0xFFA1A1AA), size: 18)),
              items: const [
                DropdownMenuItem(value: 'Música', child: Text('Música')),
                DropdownMenuItem(value: 'Social', child: Text('Social')),
                DropdownMenuItem(value: 'Arte', child: Text('Arte')),
                DropdownMenuItem(value: 'Drop', child: Text('Drop Surpresa')),
              ],
              onChanged: (val) {
                if (val != null) setState(() => _selectedCategory = val);
              },
            ),
            const SizedBox(height: 18),

            // Data & Hora
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Data *',
                        style: GoogleFonts.inter(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 8),
                      InkWell(
                        onTap: _pickDate,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 14),
                          decoration: BoxDecoration(
                            color: const Color(0xFF18181B),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white24, width: 1.0),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.calendar_today_rounded,
                                  color: Color(0xFFA855F7), size: 16),
                              const SizedBox(width: 8),
                              Text(
                                DateFormat('d MMM yyyy').format(_selectedDate),
                                style: GoogleFonts.inter(
                                    color: Colors.white, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Hora *',
                        style: GoogleFonts.inter(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 8),
                      InkWell(
                        onTap: _pickTime,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 14),
                          decoration: BoxDecoration(
                            color: const Color(0xFF18181B),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white24, width: 1.0),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.access_time_rounded,
                                  color: Color(0xFFA855F7), size: 16),
                              const SizedBox(width: 8),
                              Text(
                                _selectedTime.format(context),
                                style: GoogleFonts.inter(
                                    color: Colors.white, fontSize: 13),
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
            const SizedBox(height: 18),

            // Escolher Local no Mapa
            Text(
              'Local e Morada *',
              style: GoogleFonts.inter(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _locationNameController,
                    style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                    decoration: _inputDecoration(
                      'Nome do local (ex: Plano B)',
                      prefixIcon: const Icon(Icons.place_rounded,
                          color: Color(0xFFA1A1AA), size: 18),
                    ),
                    validator: (v) =>
                        (v == null || v.isEmpty) ? 'Indica o local.' : null,
                  ),
                ),
                const SizedBox(width: 10),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFA855F7)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 15),
                  ),
                  onPressed: _chooseLocationOnMap,
                  icon: const Icon(Icons.map_rounded,
                      color: Color(0xFFA855F7), size: 18),
                  label: Text(
                    'Mapa',
                    style: GoogleFonts.inter(
                      color: const Color(0xFFA855F7),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Preço do Bilhete
            Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Switch(
                        value: _isFree,
                        activeThumbColor: const Color(0xFFA855F7),
                        onChanged: (val) {
                          setState(() {
                            _isFree = val;
                          });
                        },
                      ),
                      Text(
                        'Evento Gratuito',
                        style: GoogleFonts.inter(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                if (!_isFree)
                  SizedBox(
                    width: 140,
                    child: TextFormField(
                      controller: _priceController,
                      keyboardType: TextInputType.number,
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                      decoration: _inputDecoration(
                        '0.00',
                        suffixIcon: const Padding(
                          padding: EdgeInsets.all(12.0),
                          child: Text('€', style: TextStyle(color: Colors.white)),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 18),

            // Descrição (opcional)
            Text(
              'Descrição do Evento',
              style: GoogleFonts.inter(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _descriptionController,
              maxLines: 3,
              style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
              decoration: _inputDecoration(
                'Detalhes, alinhamento de DJs, requisitos...',
              ),
            ),
            const SizedBox(height: 28),

            // Lógica de Bloqueio Freemium no Botão Final
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: isLocked
                      ? const Color(0xFF27272A) // Cinzento quando bloqueado
                      : const Color(0xFFA855F7), // Roxo destaque quando permitido
                  foregroundColor: isLocked
                      ? const Color(0xFFA1A1AA)
                      : Colors.white,
                  elevation: isLocked ? 0 : 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                onPressed: _submitForm,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      isLocked ? Icons.lock_rounded : Icons.rocket_launch_rounded,
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      isLocked
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
    );
  }
}

// =============================================================================
// SUB-WIDGET: UpgradePlanDialog
// =============================================================================
class UpgradePlanDialog extends StatelessWidget {
  final String currentTier;
  final VoidCallback onUpgradeSuccess;

  const UpgradePlanDialog({
    super.key,
    required this.currentTier,
    required this.onUpgradeSuccess,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF18181B),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: Color(0xFF27272A)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(26),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFF7A00).withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.workspace_premium_rounded,
                color: Color(0xFFFF7A00),
                size: 36,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Upgrade para PROMOTER PREMIUM',
              textAlign: TextAlign.center,
              style: GoogleFonts.plusJakartaSans(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Publica eventos ilimitados e acede a ferramentas avançadas de radar e drops no Porto.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                color: const Color(0xFFA1A1AA),
                fontSize: 13,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 20),
            _benefitRow('Eventos e Drops Ilimitados todos os meses'),
            _benefitRow('Pins destacados e animados no mapa Mapbox'),
            _benefitRow('Acesso a métricas detalhadas de conversão e cliques'),
            _benefitRow('Destaque nas notificações para utilizadores no Porto'),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF27272A)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: () => Navigator.of(context).pop(),
                    child: Text(
                      'Agora Não',
                      style: GoogleFonts.inter(color: const Color(0xFFA1A1AA)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF7A00),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      elevation: 4,
                    ),
                    onPressed: onUpgradeSuccess,
                    child: Text(
                      'Ativar 5€/mês',
                      style: GoogleFonts.inter(fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _benefitRow(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          const Icon(Icons.check_circle_rounded,
              color: Color(0xFF10B981), size: 16),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.inter(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
