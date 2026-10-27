import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '/flutter_flow/flutter_flow_theme.dart';

/// Corporate, minimalist Light Theme Promoter Dashboard for LOTUS.
/// Features a pure pearl/soft-grey background (Color(0xFFF9FAFB)),
/// pure white cards with soft dispersed shadows, and crisp typography.
class LotusAdminScreen extends StatefulWidget {
  const LotusAdminScreen({super.key});

  static String routeName = 'LotusAdmin';
  static String routePath = '/lotusAdmin';

  @override
  State<LotusAdminScreen> createState() => _LotusAdminScreenState();
}

class _LotusAdminScreenState extends State<LotusAdminScreen> {
  // Theme Tokens
  static const Color scaffoldBg = Color(0xFFF9FAFB);
  static const Color cardBg = Colors.white;
  static const Color textPrimary = Color(0xFF1F2937);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textMuted = Color(0xFF9CA3AF);
  static const Color borderColor = Color(0xFFE5E7EB);
  static const Color primaryAccent = Color(0xFFFF5E00);

  // Soft dispersed card shadow
  static final List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.04),
      blurRadius: 10,
      offset: const Offset(0, 4),
    ),
  ];

  // Form controllers
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _locationController = TextEditingController();
  final _dateController = TextEditingController();
  final _categoryController = TextEditingController();

  // Mock events list
  final List<Map<String, String>> _events = [
    {
      'title': 'Sunset Ribeira & Wine Sessions',
      'date': 'Sáb, 1 Nov • 18:00',
      'category': 'Música',
      'location': 'Jardim do Morro, Porto',
    },
    {
      'title': 'Techno Warehouse Baixa',
      'date': 'Sex, 31 Out • 23:00',
      'category': 'Música',
      'location': 'Plano B, Porto',
    },
    {
      'title': 'Art & Wine Social Gallery',
      'date': 'Dom, 2 Nov • 16:30',
      'category': 'Arte',
      'location': 'Maus Hábitos, Porto',
    },
    {
      'title': 'Drop Secreto Sneakers Porto',
      'date': 'Sáb, 8 Nov • 15:00',
      'category': 'Drop',
      'location': 'Aliados, Porto',
    },
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _locationController.dispose();
    _dateController.dispose();
    _categoryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = FlutterFlowTheme.of(context);

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: scaffoldBg,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 1,
          shadowColor: Colors.black.withValues(alpha: 0.08),
          centerTitle: false,
          title: Text(
            'LOTUS PROMOTER',
            style: GoogleFonts.plusJakartaSans(
              color: textPrimary,
              fontSize: 17,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.8,
            ),
          ),
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(48),
            child: Container(
              color: Colors.white,
              child: TabBar(
                indicatorColor: primaryAccent,
                indicatorWeight: 3,
                labelColor: textPrimary,
                unselectedLabelColor: textMuted,
                labelStyle: GoogleFonts.plusJakartaSans(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
                unselectedLabelStyle: GoogleFonts.plusJakartaSans(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
                tabs: const [
                  Tab(text: 'Visão Geral'),
                  Tab(text: 'Eventos'),
                  Tab(text: 'Criar Evento'),
                ],
              ),
            ),
          ),
        ),
        body: TabBarView(
          children: [
            // Tab 1: Visão Geral (Dashboard)
            _buildOverviewTab(theme),

            // Tab 2: Eventos
            _buildEventsTab(theme),

            // Tab 3: Criar Evento
            _buildCreateEventTab(theme),
          ],
        ),
      ),
    );
  }

  // ===========================================================================
  // TAB 1: VISÃO GERAL (Dashboard)
  // ===========================================================================
  Widget _buildOverviewTab(FlutterFlowTheme theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 28.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Cartão do Plano (Topo)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20.0),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(12.0),
              border: Border.all(color: borderColor, width: 1.0),
              boxShadow: cardShadow,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Lado Esquerdo: Info do Plano
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Plano Atual: Freemium',
                        style: GoogleFonts.plusJakartaSans(
                          color: textPrimary,
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4.0),
                      Text(
                        '0/1 eventos este mês',
                        style: GoogleFonts.inter(
                          color: textSecondary,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16.0),

                // Lado Direito: Botão Upgrade
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryAccent,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20.0, vertical: 12.0),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                  ),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        backgroundColor: textPrimary,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                        content: Text(
                          'Acesso ao plano Ilimitado (5€/mês).',
                          style: GoogleFonts.inter(color: Colors.white),
                        ),
                      ),
                    );
                  },
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
          const SizedBox(height: 28.0),

          // Título de Secção
          Text(
            'Métricas de Desempenho',
            style: GoogleFonts.plusJakartaSans(
              color: textPrimary,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 14.0),

          // 2. Cartões de Métricas (GridView achatado: childAspectRatio 2.0)
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 700;

              return GridView.count(
                crossAxisCount: isWide ? 4 : 2,
                crossAxisSpacing: 14.0,
                mainAxisSpacing: 14.0,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                childAspectRatio: 2.0,
                children: [
                  _buildMetricCard(
                    title: 'Total Eventos',
                    value: '${_events.length}',
                    icon: Icons.calendar_today_rounded,
                  ),
                  _buildMetricCard(
                    title: 'Cliques no Mapa',
                    value: '1.420',
                    icon: Icons.touch_app_rounded,
                  ),
                  _buildMetricCard(
                    title: 'Pessoas no Radar',
                    value: '850',
                    icon: Icons.radar_rounded,
                  ),
                  _buildMetricCard(
                    title: 'Taxa de Conversão',
                    value: '18.4%',
                    icon: Icons.trending_up_rounded,
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  // Cartão achatado individual (childAspectRatio: 2.0)
  // Layout: Título em cinza claro no topo, Ícone no canto direito, e Número gigante no centro.
  Widget _buildMetricCard({
    required String title,
    required String value,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: borderColor, width: 1.0),
        boxShadow: cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                    color: textMuted,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              Icon(icon, color: primaryAccent, size: 16),
            ],
          ),
          Center(
            child: Text(
              value,
              style: GoogleFonts.plusJakartaSans(
                color: textPrimary,
                fontSize: 26,
                fontWeight: FontWeight.bold,
                letterSpacing: -0.5,
              ),
            ),
          ),
          const SizedBox(height: 2),
        ],
      ),
    );
  }

  // ===========================================================================
  // TAB 2: EVENTOS (Meus Eventos em White Card Style)
  // ===========================================================================
  Widget _buildEventsTab(FlutterFlowTheme theme) {
    if (_events.isEmpty) {
      return Center(
        child: Text(
          'Nenhum evento registado.',
          style: GoogleFonts.inter(color: textSecondary, fontSize: 14),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 24.0),
      itemCount: _events.length,
      itemBuilder: (context, index) {
        final event = _events[index];

        return Container(
          margin: const EdgeInsets.only(bottom: 12.0),
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(12.0),
            border: Border.all(color: borderColor, width: 1.0),
            boxShadow: cardShadow,
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8.0, vertical: 2.0),
                          decoration: BoxDecoration(
                            color: primaryAccent.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(6.0),
                          ),
                          child: Text(
                            event['category'] ?? 'Geral',
                            style: GoogleFonts.inter(
                              color: primaryAccent,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8.0),
                        Expanded(
                          child: Text(
                            event['date'] ?? '',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(
                              color: textSecondary,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6.0),
                    Text(
                      event['title'] ?? '',
                      style: GoogleFonts.plusJakartaSans(
                        color: textPrimary,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (event['location'] != null) ...[
                      const SizedBox(height: 2.0),
                      Text(
                        event['location']!,
                        style: GoogleFonts.inter(
                          color: textMuted,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: const Icon(Icons.edit_outlined,
                        color: textSecondary, size: 20),
                    tooltip: 'Editar',
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: textPrimary,
                          content: Text(
                            'Editar "${event['title']}"',
                            style: GoogleFonts.inter(color: Colors.white),
                          ),
                        ),
                      );
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline_rounded,
                        color: Color(0xFFEF4444), size: 20),
                    tooltip: 'Apagar',
                    onPressed: () {
                      setState(() {
                        _events.removeAt(index);
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: textPrimary,
                          content: Text(
                            'Evento removido.',
                            style: GoogleFonts.inter(color: Colors.white),
                          ),
                        ),
                      );
                    },
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
  // TAB 3: CRIAR EVENTO (Formulário Limpo em White Card Style)
  // ===========================================================================
  Widget _buildCreateEventTab(FlutterFlowTheme theme) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 28.0),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 540),
          child: Container(
            padding: const EdgeInsets.all(28.0),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(14.0),
              border: Border.all(color: borderColor, width: 1.0),
              boxShadow: cardShadow,
            ),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Criar Novo Evento',
                    style: GoogleFonts.plusJakartaSans(
                      color: textPrimary,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    'Preenche os detalhes para publicar o evento no radar.',
                    style: GoogleFonts.inter(
                      color: textSecondary,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 24.0),

                  // Título
                  _buildFieldLabel('Título'),
                  TextFormField(
                    controller: _titleController,
                    style: GoogleFonts.inter(color: textPrimary, fontSize: 14),
                    decoration: _inputDecoration('Ex: Sunset Ribeira Sessions'),
                  ),
                  const SizedBox(height: 16.0),

                  // Morada / Link GPS
                  _buildFieldLabel('Morada / Link GPS'),
                  TextFormField(
                    controller: _locationController,
                    style: GoogleFonts.inter(color: textPrimary, fontSize: 14),
                    decoration:
                        _inputDecoration('Ex: Jardim do Morro, Vila Nova de Gaia'),
                  ),
                  const SizedBox(height: 16.0),

                  // Data
                  _buildFieldLabel('Data'),
                  TextFormField(
                    controller: _dateController,
                    style: GoogleFonts.inter(color: textPrimary, fontSize: 14),
                    decoration: _inputDecoration('Ex: 1 Nov 2026, 18:00'),
                  ),
                  const SizedBox(height: 16.0),

                  // Categoria
                  _buildFieldLabel('Categoria'),
                  TextFormField(
                    controller: _categoryController,
                    style: GoogleFonts.inter(color: textPrimary, fontSize: 14),
                    decoration: _inputDecoration('Ex: Música, Arte, Social, Drop'),
                  ),
                  const SizedBox(height: 28.0),

                  // Botão Publicar Evento
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryAccent,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                      ),
                      onPressed: () {
                        // Mock Lógica requerida pelo prompt
                        print('Verificar quota do plano Freemium antes de gravar');

                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: textPrimary,
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                            content: Text(
                              'Verificar quota do plano Freemium antes de gravar',
                              style: GoogleFonts.inter(color: Colors.white),
                            ),
                          ),
                        );
                      },
                      child: Text(
                        'Publicar Evento',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
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

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Text(
        label,
        style: GoogleFonts.inter(
          color: textPrimary,
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(color: textMuted, fontSize: 13),
      filled: true,
      fillColor: const Color(0xFFF9FAFB),
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10.0),
        borderSide: const BorderSide(color: borderColor, width: 1.0),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10.0),
        borderSide: const BorderSide(color: primaryAccent, width: 1.5),
      ),
    );
  }
}
