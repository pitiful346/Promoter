import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Modern B2B SaaS Promoter Dashboard for LOTUS.
/// Architecture: Left Sidebar (Side Menu) + Main Content Area.
/// Palette: Soft Pearl-Grey Scaffold (0xFFF4F5F7), Pure White Cards, Crisp Typography.
class LotusAdminScreen extends StatefulWidget {
  const LotusAdminScreen({super.key});

  static String routeName = 'LotusAdmin';
  static String routePath = '/lotusAdmin';

  @override
  State<LotusAdminScreen> createState() => _LotusAdminScreenState();
}

class _LotusAdminScreenState extends State<LotusAdminScreen> {
  // Navigation State
  int _selectedMenuIndex = 0;

  // Design Tokens
  static const Color scaffoldBackground = Color(0xFFF4F5F7);
  static const Color sidebarBackground = Colors.white;
  static const Color textDark = Color(0xFF111827);
  static const Color textMedium = Color(0xFF6B7280);
  static const Color primaryAccent = Color(0xFFFF5E00); // Brand Orange

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: scaffoldBackground,
      body: Row(
        children: [
          // A) Menu Lateral (Left Sidebar, largura fixa: 250px)
          _buildSidebar(),

          // B) Expanded Content Area (direita, ocupa o resto do ecrã)
          Expanded(
            child: _buildMainContent(),
          ),
        ],
      ),
    );
  }

  // ===========================================================================
  // A) MENU LATERAL (Left Sidebar)
  // ===========================================================================
  Widget _buildSidebar() {
    return Container(
      width: 250,
      height: double.infinity,
      decoration: BoxDecoration(
        color: sidebarBackground,
        border: Border(
          right: BorderSide(
            color: Colors.grey.shade200,
            width: 1.0,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Topo (Logo / Branding)
          Padding(
            padding: const EdgeInsets.fromLTRB(24.0, 32.0, 24.0, 24.0),
            child: Text(
              'LOTUS PROMOTER',
              style: GoogleFonts.plusJakartaSans(
                color: textDark,
                fontSize: 16,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.8,
              ),
            ),
          ),
          const SizedBox(height: 8.0),

          // Opções de Navegação
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              children: [
                // Botão 1: 'Dashboard' (Ativo)
                _buildNavItem(
                  index: 0,
                  label: 'Dashboard',
                  icon: Icons.bar_chart_rounded,
                ),
                const SizedBox(height: 4.0),

                // Botão 2: 'Meus Eventos' (Inativo)
                _buildNavItem(
                  index: 1,
                  label: 'Meus Eventos',
                  icon: Icons.event_note_rounded,
                ),
                const SizedBox(height: 4.0),

                // Botão 3: 'Criar Evento' (Inativo)
                _buildNavItem(
                  index: 2,
                  label: 'Criar Evento',
                  icon: Icons.add_circle_outline_rounded,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required String label,
    required IconData icon,
  }) {
    final bool isActive = _selectedMenuIndex == index;

    return InkWell(
      borderRadius: BorderRadius.circular(10.0),
      onTap: () {
        setState(() {
          _selectedMenuIndex = index;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFFF3F4F6) : Colors.transparent,
          borderRadius: BorderRadius.circular(10.0),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 20,
              color: isActive ? textDark : textMedium,
            ),
            const SizedBox(width: 12.0),
            Expanded(
              child: Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.inter(
                  color: isActive ? textDark : textMedium,
                  fontSize: 14,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ===========================================================================
  // B) ÁREA DE CONTEÚDO PRINCIPAL (Visão Geral / Dashboard)
  // ===========================================================================
  Widget _buildMainContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(40.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Bloco 1 (Plano Atual)
          _buildPlanCard(),

          const SizedBox(height: 30.0),

          // Bloco 2 (Métricas)
          Text(
            'Visão Geral',
            style: GoogleFonts.plusJakartaSans(
              color: textDark,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16.0),

          // Row com 4 Expanded Containers
          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  title: 'Total Eventos',
                  value: '12',
                ),
              ),
              const SizedBox(width: 16.0),
              Expanded(
                child: _buildMetricCard(
                  title: 'Cliques no Mapa',
                  value: '1.420',
                ),
              ),
              const SizedBox(width: 16.0),
              Expanded(
                child: _buildMetricCard(
                  title: 'Pessoas no Radar',
                  value: '850',
                ),
              ),
              const SizedBox(width: 16.0),
              Expanded(
                child: _buildMetricCard(
                  title: 'Taxa de Conversão',
                  value: '18.4%',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Bloco 1: Cartão de Plano Atual
  Widget _buildPlanCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 22.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: Colors.grey.shade200, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Esquerda: Informação do Plano
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Plano Atual: Freemium',
                  style: GoogleFonts.plusJakartaSans(
                    color: Colors.black87,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4.0),
                Text(
                  '0/1 eventos este mês',
                  style: GoogleFonts.inter(
                    color: textMedium,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16.0),

          // Direita: Botão de Upgrade
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryAccent,
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 12.0),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10.0),
              ),
            ),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: textDark,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  content: Text(
                    'Upgrade para plano Ilimitado (5€/mês).',
                    style: GoogleFonts.inter(color: Colors.white),
                  ),
                ),
              );
            },
            child: Text(
              'Fazer Upgrade (5€/mês)',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Bloco 2: Cartão de Métrica Individual (altura fixa: 120px)
  Widget _buildMetricCard({
    required String title,
    required String value,
  }) {
    return Container(
      height: 120,
      padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 14.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14.0),
        border: Border.all(color: Colors.grey.shade200, width: 1.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Título no canto superior esquerdo
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.inter(
              color: textMedium,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),

          // Número gigante no canto inferior esquerdo
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              value,
              style: GoogleFonts.plusJakartaSans(
                color: textDark,
                fontSize: 28,
                fontWeight: FontWeight.bold,
                letterSpacing: -0.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
