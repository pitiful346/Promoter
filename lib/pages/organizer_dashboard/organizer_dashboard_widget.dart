import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';
import '/components/button/button_widget.dart';
import '/components/event_card/event_card_widget.dart';
import '/components/main_sidebar/main_sidebar_widget.dart';
import '/components/metric_card/metric_card_widget.dart';
import '/components/tab_group/tab_group_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'organizer_dashboard_model.dart';
import 'promoter_dashboard_status.dart';
export 'organizer_dashboard_model.dart';
export 'promoter_dashboard_status.dart';

class OrganizerDashboardWidget extends StatefulWidget {
  const OrganizerDashboardWidget({super.key});

  static String routeName = 'OrganizerDashboard';
  static String routePath = '/organizerDashboard';

  @override
  State<OrganizerDashboardWidget> createState() =>
      _OrganizerDashboardWidgetState();
}

class _OrganizerDashboardWidgetState extends State<OrganizerDashboardWidget> {
  late OrganizerDashboardModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => OrganizerDashboardModel());
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
        body: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            wrapWithModel(
              model: _model.mainSidebarModel,
              updateCallback: () => safeSetState(() {}),
              child: MainSidebarWidget(
                activeTab: 'dashboard',
              ),
            ),
            Expanded(
              flex: 1,
              child: Container(
                child: SingleChildScrollView(
                  primary: false,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Padding(
                        padding: EdgeInsets.all(32.0),
                        child: Container(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              StreamBuilder<UsersRecord>(
                                stream: currentUserReference != null
                                    ? UsersRecord.getDocument(
                                        currentUserReference!)
                                    : null,
                                initialData: currentUserDocument,
                                builder: (context, snapshot) {
                                  final user =
                                      snapshot.data ?? currentUserDocument;
                                  final status =
                                      PromoterDashboardStatus.fromUser(user);

                                  return Column(
                                    mainAxisSize: MainAxisSize.min,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.stretch,
                                    children: [
                                      _buildHeaderRow(context, status, user),
                                      const SizedBox(height: 20.0),
                                      _buildStatusCard(context, status, user),
                                    ],
                                  );
                                },
                              ),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Expanded(
                                    flex: 1,
                                    child: wrapWithModel(
                                      model: _model.metricCardModel1,
                                      updateCallback: () => safeSetState(() {}),
                                      child: MetricCardWidget(
                                        title: 'Total Revenue',
                                        trend: '+14.2%',
                                        value: '\$128,430',
                                        up: true,
                                      ),
                                    ),
                                  ),
                                  Expanded(
                                    flex: 1,
                                    child: wrapWithModel(
                                      model: _model.metricCardModel2,
                                      updateCallback: () => safeSetState(() {}),
                                      child: MetricCardWidget(
                                        title: 'Tickets Sold',
                                        trend: '+8.1%',
                                        value: '12,402',
                                        up: true,
                                      ),
                                    ),
                                  ),
                                  Expanded(
                                    flex: 1,
                                    child: wrapWithModel(
                                      model: _model.metricCardModel3,
                                      updateCallback: () => safeSetState(() {}),
                                      child: MetricCardWidget(
                                        title: 'Avg. Attendance',
                                        trend: '-2.4%',
                                        value: '88%',
                                        up: false,
                                      ),
                                    ),
                                  ),
                                  Expanded(
                                    flex: 1,
                                    child: wrapWithModel(
                                      model: _model.metricCardModel4,
                                      updateCallback: () => safeSetState(() {}),
                                      child: MetricCardWidget(
                                        title: 'Active Boosts',
                                        trend: 'Stable',
                                        value: '6',
                                        up: true,
                                      ),
                                    ),
                                  ),
                                ].divide(SizedBox(width: 24.0)),
                              ),
                              SingleChildScrollView(
                                primary: false,
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: [
                                    Row(
                                      mainAxisSize: MainAxisSize.max,
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.center,
                                      children: [
                                        wrapWithModel(
                                          model: _model.tabGroupModel,
                                          updateCallback: () =>
                                              safeSetState(() {}),
                                          child: TabGroupWidget(
                                            label2: 'Drafts',
                                            label2Present: true,
                                            label3: 'Past',
                                            label3Present: true,
                                            label4: '',
                                            label4Present: false,
                                            label5: '',
                                            label5Present: false,
                                            label1: 'Active',
                                          ),
                                        ),
                                        wrapWithModel(
                                          model: _model.buttonModel2,
                                          updateCallback: () =>
                                              safeSetState(() {}),
                                          child: ButtonWidget(
                                            icon: Icon(
                                              Icons.filter_list_rounded,
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .primaryText,
                                              size: 24.0,
                                            ),
                                            iconPresent: true,
                                            iconEndPresent: false,
                                            content: 'Filter',
                                            variant: 'outline',
                                            size: 'small',
                                            fullWidth: false,
                                            loading: false,
                                            disabled: false,
                                          ),
                                        ),
                                      ],
                                    ),
                                    StreamBuilder<List<EventsRecord>>(
                                      stream: queryEventsRecord(
                                        queryBuilder: (eventsRecord) =>
                                            eventsRecord.where(
                                          'organizer_id',
                                          isEqualTo: currentUserReference,
                                        ),
                                      ),
                                      builder: (context, snapshot) {
                                        // Customize what your widget looks like when it's loading.
                                        if (!snapshot.hasData) {
                                          return Center(
                                            child: SizedBox(
                                              width: 50.0,
                                              height: 50.0,
                                              child: CircularProgressIndicator(
                                                valueColor:
                                                    AlwaysStoppedAnimation<
                                                        Color>(
                                                  FlutterFlowTheme.of(context)
                                                      .primary,
                                                ),
                                              ),
                                            ),
                                          );
                                        }
                                        List<EventsRecord>
                                            gridViewEventsRecordList =
                                            snapshot.data!;
                                        if (gridViewEventsRecordList.isEmpty) {
                                          return Image.asset(
                                            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_rjZdcePVp7vjnLcMGP1cguywZ6epEqVfAXjKlNWEyw&s=10',
                                          );
                                        }

                                        return Wrap(
                                          spacing: 16.0,
                                          runSpacing: 16.0,
                                          alignment: WrapAlignment.start,
                                          crossAxisAlignment:
                                              WrapCrossAlignment.start,
                                          direction: Axis.horizontal,
                                          runAlignment: WrapAlignment.start,
                                          verticalDirection:
                                              VerticalDirection.down,
                                          clipBehavior: Clip.none,
                                          children: List.generate(
                                              gridViewEventsRecordList.length,
                                              (gridViewIndex) {
                                            final gridViewEventsRecord =
                                                gridViewEventsRecordList[
                                                    gridViewIndex];
                                            return Padding(
                                              padding: EdgeInsetsDirectional
                                                  .fromSTEB(
                                                      0.0, 0.0, 20.0, 20.0),
                                              child: InkWell(
                                                splashColor: Colors.transparent,
                                                focusColor: Colors.transparent,
                                                hoverColor: Colors.transparent,
                                                highlightColor:
                                                    Colors.transparent,
                                                onTap: () async {
                                                  context.pushNamed(
                                                    EventDetailsWidget
                                                        .routeName,
                                                    queryParameters: {
                                                      'eventoSelecionado':
                                                          serializeParam(
                                                        gridViewEventsRecord,
                                                        ParamType.Document,
                                                      ),
                                                    }.withoutNulls,
                                                    extra: <String, dynamic>{
                                                      'eventoSelecionado':
                                                          gridViewEventsRecord,
                                                    },
                                                  );
                                                },
                                                child: wrapWithModel(
                                                  model: _model.eventCardModels
                                                      .getModel(
                                                    gridViewEventsRecord
                                                        .reference.id,
                                                    gridViewIndex,
                                                  ),
                                                  updateCallback: () =>
                                                      safeSetState(() {}),
                                                  child: EventCardWidget(
                                                    key: Key(
                                                      'Key51r_${gridViewEventsRecord.reference.id}',
                                                    ),
                                                    eventoCard:
                                                        gridViewEventsRecord,
                                                  ),
                                                ),
                                              ),
                                            );
                                          }),
                                        );
                                      },
                                    ),
                                  ].divide(SizedBox(height: 24.0)),
                                ),
                              ),
                            ].divide(SizedBox(height: 32.0)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderRow(
    BuildContext context,
    PromoterDashboardStatus status,
    UsersRecord? user,
  ) {
    return Wrap(
      alignment: WrapAlignment.spaceBetween,
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 16.0,
      runSpacing: 12.0,
      children: [
        Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Organizer Dashboard',
              style: FlutterFlowTheme.of(context).headlineMedium.override(
                    font: GoogleFonts.plusJakartaSans(
                      fontWeight: FontWeight.w800,
                      fontStyle: FlutterFlowTheme.of(context)
                          .headlineMedium
                          .fontStyle,
                    ),
                    color: FlutterFlowTheme.of(context).primaryText,
                    letterSpacing: 0.0,
                    fontWeight: FontWeight.w800,
                    lineHeight: 1.25,
                  ),
            ),
            const SizedBox(height: 4.0),
            Text(
              'Welcome back. Your events are performing 12% better this week.',
              style: FlutterFlowTheme.of(context).bodyMedium.override(
                    font: GoogleFonts.inter(
                      fontWeight:
                          FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                      fontStyle:
                          FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                    ),
                    color: FlutterFlowTheme.of(context).secondaryText,
                    letterSpacing: 0.0,
                    lineHeight: 1.5,
                  ),
            ),
          ],
        ),
        _buildActionButtons(context, status, user),
      ],
    );
  }

  Widget _buildActionButtons(
    BuildContext context,
    PromoterDashboardStatus status,
    UsersRecord? user,
  ) {
    if (status.isQuotaExhausted) {
      return Wrap(
        spacing: 12.0,
        runSpacing: 10.0,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          // Highlight button (Neon Orange): Upgrade CTA
          InkWell(
            splashColor: Colors.transparent,
            focusColor: Colors.transparent,
            hoverColor: Colors.transparent,
            highlightColor: Colors.transparent,
            onTap: () => _showUpgradeDialog(context, user),
            child: Container(
              height: 44.0,
              padding: const EdgeInsets.symmetric(horizontal: 18.0),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFF7A00), Color(0xFFFF5500)],
                ),
                borderRadius: BorderRadius.circular(12.0),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x66FF6B00),
                    blurRadius: 16.0,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.bolt_rounded,
                    color: Colors.white,
                    size: 20.0,
                  ),
                  const SizedBox(width: 8.0),
                  Text(
                    'Fazer Upgrade para Eventos Ilimitados (5€/mês)',
                    style: GoogleFonts.plusJakartaSans(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 13.5,
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Inactive (Cinzento) Button: Create New Event (Locked)
          InkWell(
            splashColor: Colors.transparent,
            focusColor: Colors.transparent,
            hoverColor: Colors.transparent,
            highlightColor: Colors.transparent,
            onTap: () {
              ScaffoldMessenger.of(context).hideCurrentSnackBar();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: const Color(0xFF27272A),
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10.0),
                    side: const BorderSide(color: Color(0xFFFF6B00), width: 1.0),
                  ),
                  content: Row(
                    children: [
                      const Icon(Icons.lock_rounded, color: Color(0xFFFF6B00)),
                      const SizedBox(width: 10.0),
                      Expanded(
                        child: Text(
                          'Quota mensal esgotada (1/1 eventos). Faz upgrade para continuares a publicar!',
                          style: GoogleFonts.inter(
                            color: Colors.white,
                            fontSize: 13.0,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                  action: SnackBarAction(
                    label: 'Upgrade (5€/mês)',
                    textColor: const Color(0xFFFF6B00),
                    onPressed: () => _showUpgradeDialog(context, user),
                  ),
                ),
              );
            },
            child: Container(
              height: 44.0,
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              decoration: BoxDecoration(
                color: const Color(0xFF27272A),
                borderRadius: BorderRadius.circular(12.0),
                border: Border.all(
                  color: const Color(0xFF3F3F46),
                  width: 1.0,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.lock_outline_rounded,
                    color: Color(0xFF71717A),
                    size: 18.0,
                  ),
                  const SizedBox(width: 8.0),
                  Text(
                    'Criar Novo Evento',
                    style: GoogleFonts.inter(
                      color: const Color(0xFF71717A),
                      fontWeight: FontWeight.w600,
                      fontSize: 13.5,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    }

    // Active State: Button is active and ready to use
    return InkWell(
      splashColor: Colors.transparent,
      focusColor: Colors.transparent,
      hoverColor: Colors.transparent,
      highlightColor: Colors.transparent,
      onTap: () async {
        context.pushNamed(CreateNewEventWidget.routeName);
      },
      child: wrapWithModel(
        model: _model.buttonModel1,
        updateCallback: () => safeSetState(() {}),
        child: ButtonWidget(
          icon: Icon(
            Icons.add_rounded,
            color: FlutterFlowTheme.of(context).primaryText,
            size: 24.0,
          ),
          iconPresent: true,
          iconEndPresent: false,
          content: 'Create New Event',
          variant: 'primary',
          size: 'medium',
          fullWidth: false,
          loading: false,
          disabled: false,
        ),
      ),
    );
  }

  Widget _buildStatusCard(
    BuildContext context,
    PromoterDashboardStatus status,
    UsersRecord? user,
  ) {
    final theme = FlutterFlowTheme.of(context);
    final isPremium = status.isUnlimited;
    final isQuotaExhausted = status.isQuotaExhausted;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: theme.secondaryBackground,
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(
          color: isPremium
              ? const Color(0x66A855F7)
              : (isQuotaExhausted
                  ? const Color(0x66FF6B00)
                  : const Color(0xFF27272A)),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: isPremium
                ? const Color(0x22A855F7)
                : (isQuotaExhausted
                    ? const Color(0x22FF6B00)
                    : const Color(0x1A000000)),
            blurRadius: 18.0,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20.0),
      child: isPremium
          ? _buildPremiumStatusCardContent(context, status)
          : _buildFreeStatusCardContent(context, status, user),
    );
  }

  Widget _buildPremiumStatusCardContent(
    BuildContext context,
    PromoterDashboardStatus status,
  ) {
    final theme = FlutterFlowTheme.of(context);

    return Wrap(
      alignment: WrapAlignment.spaceBetween,
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 20.0,
      runSpacing: 16.0,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Badge / Seal (PROMOTER PREMIUM)
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14.0, vertical: 8.0),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF7C3AED), Color(0xFFA855F7)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(999.0),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x55A855F7),
                    blurRadius: 12.0,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.workspace_premium_rounded,
                    color: Color(0xFFFFD700),
                    size: 19.0,
                  ),
                  const SizedBox(width: 8.0),
                  Text(
                    status.badgeText,
                    style: GoogleFonts.plusJakartaSans(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 12.5,
                      letterSpacing: 1.2,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16.0),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Acesso Ilimitado Ativo',
                  style: GoogleFonts.plusJakartaSans(
                    color: theme.primaryText,
                    fontSize: 16.0,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2.0),
                Text(
                  'Eventos ilimitados, destaque no mapa da cidade e suporte prioritário.',
                  style: GoogleFonts.inter(
                    color: theme.secondaryText,
                    fontSize: 13.0,
                  ),
                ),
              ],
            ),
          ],
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 8.0),
          decoration: BoxDecoration(
            color: const Color(0x1A10B981),
            borderRadius: BorderRadius.circular(999.0),
            border: Border.all(color: const Color(0xFF10B981), width: 1.0),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.check_circle_rounded,
                  color: Color(0xFF10B981), size: 16.0),
              const SizedBox(width: 6.0),
              Text(
                'Criar eventos: Ativo e Pronto',
                style: GoogleFonts.inter(
                  color: const Color(0xFF10B981),
                  fontWeight: FontWeight.w600,
                  fontSize: 12.5,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFreeStatusCardContent(
    BuildContext context,
    PromoterDashboardStatus status,
    UsersRecord? user,
  ) {
    final theme = FlutterFlowTheme.of(context);
    final isExhausted = status.isQuotaExhausted;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10.0, vertical: 4.0),
                  decoration: BoxDecoration(
                    color: isExhausted
                        ? const Color(0x22FF6B00)
                        : const Color(0x1A7C3AED),
                    borderRadius: BorderRadius.circular(6.0),
                    border: Border.all(
                      color: isExhausted
                          ? const Color(0xFFFF6B00)
                          : const Color(0xFFA855F7),
                      width: 1.0,
                    ),
                  ),
                  child: Text(
                    'PLANO FREE',
                    style: GoogleFonts.plusJakartaSans(
                      color: isExhausted
                          ? const Color(0xFFFF6B00)
                          : const Color(0xFFA855F7),
                      fontSize: 11.0,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.0,
                    ),
                  ),
                ),
                const SizedBox(width: 10.0),
                Text(
                  isExhausted
                      ? 'Quota mensal de publicações atingida'
                      : 'Quota mensal de publicações gratuitas',
                  style: GoogleFonts.plusJakartaSans(
                    color: theme.primaryText,
                    fontSize: 15.0,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            Text(
              status.quotaDisplayText,
              style: GoogleFonts.plusJakartaSans(
                color: isExhausted ? const Color(0xFFFF6B00) : theme.primaryText,
                fontSize: 14.5,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 14.0),
        // Progress Bar
        ClipRRect(
          borderRadius: BorderRadius.circular(999.0),
          child: Container(
            height: 8.0,
            width: double.infinity,
            color: const Color(0xFF27272A),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: status.progressRatio,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: isExhausted
                        ? [const Color(0xFFFF8A00), const Color(0xFFFF5500)]
                        : [const Color(0xFF7C3AED), const Color(0xFFA855F7)],
                  ),
                  boxShadow: isExhausted
                      ? [
                          const BoxShadow(
                            color: Color(0x88FF6B00),
                            blurRadius: 8.0,
                          ),
                        ]
                      : null,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 14.0),
        // Explanatory copy & CTA
        if (isExhausted)
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 16.0,
            runSpacing: 10.0,
            children: [
              Text(
                'Atingiste o teu limite gratuito de 1 evento este mês. O contador renova no dia 1.',
                style: GoogleFonts.inter(
                  color: theme.secondaryText,
                  fontSize: 13.0,
                ),
              ),
              InkWell(
                onTap: () => _showUpgradeDialog(context, user),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14.0, vertical: 8.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFF6B00),
                    borderRadius: BorderRadius.circular(10.0),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x55FF6B00),
                        blurRadius: 10.0,
                        offset: Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.bolt_rounded,
                          color: Colors.white, size: 16.0),
                      const SizedBox(width: 6.0),
                      Text(
                        'Fazer Upgrade para Eventos Ilimitados (5€/mês)',
                        style: GoogleFonts.plusJakartaSans(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 12.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          )
        else
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Tens 1 evento gratuito disponível para publicar. Cria o teu evento e promove-o junto dos estudantes.',
                style: GoogleFonts.inter(
                  color: theme.secondaryText,
                  fontSize: 13.0,
                ),
              ),
              InkWell(
                onTap: () => _showUpgradeDialog(context, user),
                child: Text(
                  'Ver Vantagens Premium (5€/mês) →',
                  style: GoogleFonts.inter(
                    color: const Color(0xFFA855F7),
                    fontWeight: FontWeight.w600,
                    fontSize: 12.5,
                  ),
                ),
              ),
            ],
          ),
      ],
    );
  }

  void _showUpgradeDialog(BuildContext context, UsersRecord? user) {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return Dialog(
          backgroundColor: const Color(0xFF141417),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20.0),
            side: const BorderSide(color: Color(0x55A855F7), width: 1.5),
          ),
          child: Container(
            width: 520.0,
            padding: const EdgeInsets.all(28.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12.0, vertical: 6.0),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFFF7A00), Color(0xFFFF5500)],
                        ),
                        borderRadius: BorderRadius.circular(999.0),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.bolt_rounded,
                              color: Colors.white, size: 16.0),
                          const SizedBox(width: 4.0),
                          Text(
                            'UPGRADE PROMOTER',
                            style: GoogleFonts.plusJakartaSans(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 11.0,
                              letterSpacing: 1.0,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded,
                          color: Color(0xFFA1A1AA)),
                      onPressed: () => Navigator.of(dialogContext).pop(),
                    ),
                  ],
                ),
                const SizedBox(height: 16.0),
                Text(
                  'Lotus Promoter Premium',
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 22.0,
                  ),
                ),
                const SizedBox(height: 6.0),
                Text(
                  '5,00 € / mês • Cancela quando quiseres, sem compromisso',
                  style: GoogleFonts.inter(
                    color: const Color(0xFFFF8A00),
                    fontWeight: FontWeight.w600,
                    fontSize: 14.0,
                  ),
                ),
                const SizedBox(height: 20.0),
                _buildBenefitRow(
                  Icons.all_inclusive_rounded,
                  'Publicação Ilimitada de Eventos',
                  'Sem limite de 1 evento por mês. Publica todos os teus eventos livremente.',
                ),
                const SizedBox(height: 12.0),
                _buildBenefitRow(
                  Icons.workspace_premium_rounded,
                  'Selo Oficial PROMOTER PREMIUM',
                  'Destaque no perfil público da tua Associação ou Produtora.',
                ),
                const SizedBox(height: 12.0),
                _buildBenefitRow(
                  Icons.trending_up_rounded,
                  'Prioridade no Feed Lotus',
                  'Os teus eventos surgem destacados no topo das pesquisas locais.',
                ),
                const SizedBox(height: 12.0),
                _buildBenefitRow(
                  Icons.bar_chart_rounded,
                  'Métricas e Relatórios Avançados',
                  'Acompanha adesão, bilhetes e desempenho dos teus eventos em tempo real.',
                ),
                const SizedBox(height: 24.0),
                InkWell(
                  onTap: () async {
                    if (currentUserReference != null) {
                      await currentUserReference!.update({
                        'subscription_tier': 'premium',
                      });
                    }
                    if (Navigator.of(dialogContext).canPop()) {
                      Navigator.of(dialogContext).pop();
                    }
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        backgroundColor: const Color(0xFF10B981),
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                        content: Row(
                          children: [
                            const Icon(Icons.check_circle_rounded,
                                color: Colors.white),
                            const SizedBox(width: 10.0),
                            Expanded(
                              child: Text(
                                '🎉 Parabéns! O teu plano foi atualizado para PROMOTER PREMIUM!',
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
                  child: Container(
                    height: 48.0,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFF7A00), Color(0xFFFF5500)],
                      ),
                      borderRadius: BorderRadius.circular(12.0),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x66FF6B00),
                          blurRadius: 16.0,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.bolt_rounded,
                            color: Colors.white, size: 20.0),
                        const SizedBox(width: 8.0),
                        Text(
                          'Ativar Plano Premium Agora (5€/mês)',
                          style: GoogleFonts.plusJakartaSans(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 14.0,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16.0),
                // Sandbox quick simulator for testing all states
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    TextButton(
                      onPressed: () async {
                        if (currentUserReference != null) {
                          await currentUserReference!.update({
                            'subscription_tier': 'free',
                            'events_published_this_month': 1,
                          });
                        }
                        if (Navigator.of(dialogContext).canPop()) {
                          Navigator.of(dialogContext).pop();
                        }
                      },
                      child: Text(
                        'Simular Free (1/1 Esgotado)',
                        style: GoogleFonts.inter(
                          color: const Color(0xFFA1A1AA),
                          fontSize: 11.5,
                        ),
                      ),
                    ),
                    const Text('•', style: TextStyle(color: Color(0xFF52525B))),
                    TextButton(
                      onPressed: () async {
                        if (currentUserReference != null) {
                          await currentUserReference!.update({
                            'subscription_tier': 'free',
                            'events_published_this_month': 0,
                          });
                        }
                        if (Navigator.of(dialogContext).canPop()) {
                          Navigator.of(dialogContext).pop();
                        }
                      },
                      child: Text(
                        'Simular Free (0/1 Disponível)',
                        style: GoogleFonts.inter(
                          color: const Color(0xFFA1A1AA),
                          fontSize: 11.5,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildBenefitRow(IconData icon, String title, String description) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 32.0,
          height: 32.0,
          decoration: BoxDecoration(
            color: const Color(0x22A855F7),
            borderRadius: BorderRadius.circular(8.0),
          ),
          child: Icon(icon, color: const Color(0xFFA855F7), size: 18.0),
        ),
        const SizedBox(width: 12.0),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.plusJakartaSans(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 13.5,
                ),
              ),
              const SizedBox(height: 2.0),
              Text(
                description,
                style: GoogleFonts.inter(
                  color: const Color(0xFFA1A1AA),
                  fontSize: 12.0,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
