import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '/flutter_flow/flutter_flow_theme.dart';

/// Clean, B2B Lotus Promoter Dashboard for the 'rho' brand.
/// Built with DefaultTabController(length: 3):
/// 1. Dashboard (Plan Status Card & Metrics Grid)
/// 2. Meus Eventos (Clean ListView with edit and delete options)
/// 3. Criar (Centered Event Creation Form)
class LotusAdminScreen extends StatefulWidget {
  const LotusAdminScreen({super.key});

  static String routeName = 'LotusAdmin';
  static String routePath = '/lotusAdmin';

  @override
  State<LotusAdminScreen> createState() => _LotusAdminScreenState();
}

class _LotusAdminScreenState extends State<LotusAdminScreen> {
  // Brand Neon Orange
  static const Color neonOrange = Color(0xFFFF5E00);
  static const Color darkBackground = Color(0xFF09090B);
  static const Color cardBackground = Color(0xFF141417);

  // Form controllers
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _locationController = TextEditingController();
  final _dateController = TextEditingController();
  final _categoryController = TextEditingController();

  // Mock events for 'Meus Eventos' tab
  final List<Map<String, String>> _myEvents = [
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
        backgroundColor: darkBackground,
        appBar: AppBar(
          backgroundColor: Colors.black,
          elevation: 0,
          centerTitle: false,
          title: Text(
            'LOTUS PROMOTER',
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.0,
            ),
          ),
          bottom: TabBar(
            indicatorColor: neonOrange,
            indicatorWeight: 3.0,
            labelColor: Colors.white,
            unselectedLabelColor: const Color(0xFF71717A),
            labelStyle: GoogleFonts.plusJakartaSans(
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
            unselectedLabelStyle: GoogleFonts.plusJakartaSans(
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
            tabs: const [
              Tab(text: 'Dashboard'),
              Tab(text: 'Meus Eventos'),
              Tab(text: 'Criar'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // Tela 1: Dashboard
            _buildDashboardTab(theme),

            // Tela 2: Meus Eventos
            _buildMyEventsTab(theme),

            // Tela 3: Criar Evento
            _buildCreateEventTab(theme),
          ],
        ),
      ),
    );
  }

  // ===========================================================================
  // TELA 1: DASHBOARD (Visão Geral e Métricas)
  // ===========================================================================
  Widget _buildDashboardTab(FlutterFlowTheme theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Cartão de Plano
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20.0),
            decoration: BoxDecoration(
              color: cardBackground,
              borderRadius: BorderRadius.circular(16.0),
              border: Border.all(color: Colors.white24, width: 1.0),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Plano Atual: Freemium',
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10.0, vertical: 4.0),
                      decoration: BoxDecoration(
                        color: neonOrange.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: neonOrange.withValues(alpha: 0.4)),
                      ),
                      child: Text(
                        '1 Grátis / Mês',
                        style: GoogleFonts.inter(
                          color: neonOrange,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16.0),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Eventos este mês',
                      style: GoogleFonts.inter(
                        color: const Color(0xFFA1A1AA),
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      '0/1 eventos',
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8.0),
                ClipRRect(
                  borderRadius: BorderRadius.circular(6.0),
                  child: const LinearProgressIndicator(
                    value: 0.0,
                    minHeight: 7.0,
                    backgroundColor: Color(0xFF27272A),
                    valueColor: AlwaysStoppedAnimation<Color>(neonOrange),
                  ),
                ),
                const SizedBox(height: 20.0),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: neonOrange,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                    ),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: const Color(0xFF18181B),
                          content: Text(
                            'Plano Ilimitado por 5€/mês disponível em breve.',
                            style: GoogleFonts.inter(color: Colors.white),
                          ),
                        ),
                      );
                    },
                    child: Text(
                      'Fazer Upgrade para Ilimitado (5€)',
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
          const SizedBox(height: 28.0),

          // Título da secção de métricas
          Text(
            'Visão Geral',
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16.0),

          // 2. Grelha de Métricas (GridView.count com 4 cartões)
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 650;
              return GridView.count(
                crossAxisCount: isWide ? 4 : 2,
                crossAxisSpacing: 14.0,
                mainAxisSpacing: 14.0,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                childAspectRatio: isWide ? 1.4 : 1.3,
                children: [
                  _buildMetricCard(
                    title: 'Total Eventos',
                    value: '${_myEvents.length}',
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

  Widget _buildMetricCard({
    required String title,
    required String value,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: cardBackground,
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: Colors.white24, width: 1.0),
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
                    color: const Color(0xFFA1A1AA),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              Icon(icon, color: neonOrange, size: 18),
            ],
          ),
          Text(
            value,
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
    );
  }

  // ===========================================================================
  // TELA 2: MEUS EVENTOS (ListView.builder)
  // ===========================================================================
  Widget _buildMyEventsTab(FlutterFlowTheme theme) {
    if (_myEvents.isEmpty) {
      return Center(
        child: Text(
          'Ainda não tens eventos criados.',
          style: GoogleFonts.inter(color: const Color(0xFFA1A1AA), fontSize: 14),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(24.0),
      itemCount: _myEvents.length,
      itemBuilder: (context, index) {
        final event = _myEvents[index];

        return Container(
          margin: const EdgeInsets.only(bottom: 14.0),
          padding: const EdgeInsets.all(18.0),
          decoration: BoxDecoration(
            color: cardBackground,
            borderRadius: BorderRadius.circular(16.0),
            border: Border.all(color: Colors.white24, width: 1.0),
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
                              horizontal: 8.0, vertical: 3.0),
                          decoration: BoxDecoration(
                            color: neonOrange.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6.0),
                          ),
                          child: Text(
                            event['category'] ?? 'Geral',
                            style: GoogleFonts.inter(
                              color: neonOrange,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            event['date'] ?? '',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(
                              color: const Color(0xFFA1A1AA),
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8.0),
                    Text(
                      event['title'] ?? '',
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (event['location'] != null) ...[
                      const SizedBox(height: 4.0),
                      Text(
                        event['location']!,
                        style: GoogleFonts.inter(
                          color: const Color(0xFF71717A),
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
                        color: Color(0xFFA1A1AA), size: 20),
                    tooltip: 'Editar',
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: const Color(0xFF18181B),
                          content: Text(
                            'A editar "${event['title']}"...',
                            style: GoogleFonts.inter(color: Colors.white),
                          ),
                        ),
                      );
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline,
                        color: Color(0xFFEF4444), size: 20),
                    tooltip: 'Apagar',
                    onPressed: () {
                      setState(() {
                        _myEvents.removeAt(index);
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: const Color(0xFF18181B),
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
  // TELA 3: CRIAR EVENTO (Formulário Centrado)
  // ===========================================================================
  Widget _buildCreateEventTab(FlutterFlowTheme theme) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Novo Evento',
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6.0),
                Text(
                  'Insere os dados para publicar o evento no radar do Porto.',
                  style: GoogleFonts.inter(
                    color: const Color(0xFFA1A1AA),
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 24.0),

                // Campo: Título
                _buildFieldLabel('Título'),
                TextFormField(
                  controller: _titleController,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                  decoration: _inputDecoration('Ex: Sunset Ribeira Sessions'),
                ),
                const SizedBox(height: 18.0),

                // Campo: Morada / Link GPS
                _buildFieldLabel('Morada / Link GPS'),
                TextFormField(
                  controller: _locationController,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                  decoration: _inputDecoration('Ex: Jardim do Morro, Gaia / Coordenadas'),
                ),
                const SizedBox(height: 18.0),

                // Campo: Data
                _buildFieldLabel('Data'),
                TextFormField(
                  controller: _dateController,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                  decoration: _inputDecoration('Ex: 1 Nov 2026, 18:00'),
                ),
                const SizedBox(height: 18.0),

                // Campo: Categoria
                _buildFieldLabel('Categoria'),
                TextFormField(
                  controller: _categoryController,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 14),
                  decoration: _inputDecoration('Ex: Música, Social, Arte, Drop'),
                ),
                const SizedBox(height: 32.0),

                // Botão: Publicar Evento
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: neonOrange,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                    ),
                    onPressed: () {
                      // Mock Lógica requerida pelo prompt
                      print('Verificar quota do plano Freemium antes de gravar');

                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: const Color(0xFF18181B),
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
                        fontSize: 15,
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
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(
        label,
        style: GoogleFonts.inter(
          color: Colors.white,
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(color: const Color(0xFF71717A), fontSize: 13),
      filled: true,
      fillColor: cardBackground,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12.0),
        borderSide: const BorderSide(color: Colors.white24, width: 1.0),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12.0),
        borderSide: const BorderSide(color: neonOrange, width: 1.5),
      ),
    );
  }
}
