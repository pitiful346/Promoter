import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// B2B Promoter Dashboard with classic Sidebar + IndexedStack architecture.
/// Contrast: Pure White Sidebar (Colors.white) vs Ultra-Light Grey Scaffold (0xFFF3F4F6).
class LotusAdminScreen extends StatefulWidget {
  const LotusAdminScreen({super.key});

  static String routeName = 'LotusAdmin';
  static String routePath = '/lotusAdmin';

  @override
  State<LotusAdminScreen> createState() => _LotusAdminScreenState();
}

class _LotusAdminScreenState extends State<LotusAdminScreen> {
  int _selectedIndex = 0;

  // Brand Colors
  static const Color neonColor = Color(0xFFFF5E00);
  static const Color activeTileBg = Color(0xFFFEE2E2);
  static const Color scaffoldBg = Color(0xFFF3F4F6);
  static const Color textDark = Color(0xFF111827);
  static const Color textMuted = Color(0xFF6B7280);
  static const Color borderColor = Color(0xFFE5E7EB);

  // Form controllers for Index 2 (Criar)
  final _titleController = TextEditingController();
  final _locationController = TextEditingController();
  final _categoryController = TextEditingController();

  @override
  void dispose() {
    _titleController.dispose();
    _locationController.dispose();
    _categoryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: scaffoldBg,
      body: Row(
        children: [
          // 2. Menu Lateral (Flex: 2)
          Expanded(
            flex: 2,
            child: _buildSidebar(),
          ),

          // 4. Área Central (Flex: 8) -> IndexedStack
          Expanded(
            flex: 8,
            child: IndexedStack(
              index: _selectedIndex,
              children: [
                // Index 0: O Dashboard
                _buildDashboardTab(),

                // Index 1: Eventos
                _buildEventsTab(),

                // Index 2: Criar
                _buildCreateTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ===========================================================================
  // 3. O MENU LATERAL (Flex: 2)
  // ===========================================================================
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
          // Título no topo
          Padding(
            padding: const EdgeInsets.all(24.0),
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
          const SizedBox(height: 8.0),

          // Column com 3 ListTiles
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
        ],
      ),
    );
  }

  Widget _buildSidebarTile({
    required int index,
    required String title,
    required IconData icon,
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
        color: isSelected ? neonColor : textMuted,
        size: 20,
      ),
      title: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          color: isSelected ? neonColor : textMuted,
        ),
      ),
      onTap: () {
        setState(() {
          _selectedIndex = index;
        });
      },
    );
  }

  // ===========================================================================
  // INDEX 0: O DASHBOARD
  // ===========================================================================
  Widget _buildDashboardTab() {
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
                      Text(
                        'Plano Atual: Freemium',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4.0),
                      Text(
                        '0/1 eventos este mês',
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
                ElevatedButton(
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
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        backgroundColor: textDark,
                        content: Text(
                          'Aceder ao plano Ilimitado (5€/mês).',
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

          // Espaçamento de 40
          const SizedBox(height: 40.0),

          // Grelha de Métricas
          Wrap(
            spacing: 20.0,
            runSpacing: 20.0,
            alignment: WrapAlignment.center,
            children: [
              _buildMetricCard('Total Eventos', '12', Icons.calendar_today_rounded),
              _buildMetricCard('Cliques no Mapa', '1.420', Icons.touch_app_rounded),
              _buildMetricCard('Pessoas no Radar', '850', Icons.radar_rounded),
              _buildMetricCard('Taxa de Conversão', '18.4%', Icons.trending_up_rounded),
            ],
          ),
        ],
      ),
    );
  }

  // Widget extrato: Container 220 x 120, fundo branco
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
              color: neonColor,
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
  // INDEX 1: EVENTOS
  // ===========================================================================
  Widget _buildEventsTab() {
    return Center(
      child: Text(
        'A Carregar os teus Eventos...',
        style: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: textMuted,
        ),
      ),
    );
  }

  // ===========================================================================
  // INDEX 2: CRIAR
  // ===========================================================================
  Widget _buildCreateTab() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(40.0),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Novo Evento',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: textDark,
                  ),
                ),
                const SizedBox(height: 24.0),

                // TextField 1: Título
                Text(
                  'Título',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: textDark,
                  ),
                ),
                const SizedBox(height: 6.0),
                TextField(
                  controller: _titleController,
                  style: GoogleFonts.inter(color: textDark, fontSize: 14),
                  decoration: _inputDecoration('Ex: Sunset na Ribeira'),
                ),
                const SizedBox(height: 18.0),

                // TextField 2: Localização
                Text(
                  'Localização / Morada',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: textDark,
                  ),
                ),
                const SizedBox(height: 6.0),
                TextField(
                  controller: _locationController,
                  style: GoogleFonts.inter(color: textDark, fontSize: 14),
                  decoration: _inputDecoration('Ex: Plano B, Porto'),
                ),
                const SizedBox(height: 18.0),

                // TextField 3: Categoria
                Text(
                  'Categoria',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: textDark,
                  ),
                ),
                const SizedBox(height: 6.0),
                TextField(
                  controller: _categoryController,
                  style: GoogleFonts.inter(color: textDark, fontSize: 14),
                  decoration: _inputDecoration('Ex: Música, Arte, Social'),
                ),
                const SizedBox(height: 28.0),

                // Botão
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: neonColor,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                    ),
                    onPressed: () {
                      print('Verificar quota do plano Freemium antes de gravar');
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: textDark,
                          content: Text(
                            'Evento submetido com sucesso.',
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
        borderSide: const BorderSide(color: neonColor, width: 1.5),
      ),
    );
  }
}
