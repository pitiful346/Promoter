import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'register_model.dart';
export 'register_model.dart';

class RegisterWidget extends StatefulWidget {
  const RegisterWidget({super.key});

  static String routeName = 'Register';
  static String routePath = '/register';

  @override
  State<RegisterWidget> createState() => _RegisterWidgetState();
}

class _RegisterWidgetState extends State<RegisterWidget> {
  late RegisterModel _model;
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  bool _isLoading = false;
  bool _agreedToTerms = true;
  String _selectedPromoterType = 'Discoteca / Clube';

  static const Color neonOrange = Color(0xFFFF5E00);
  static const Color bgPearl = Color(0xFFF3F4F6);
  static const Color textDark = Color(0xFF111827);
  static const Color textMuted = Color(0xFF6B7280);
  static const Color borderColor = Color(0xFFE5E7EB);

  final List<String> _promoterTypes = [
    'Discoteca / Clube',
    'Bar & Concerto',
    'Produtora / Festival',
    'Coletivo Cultural',
    'DJ / Artista',
  ];

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => RegisterModel());

    _model.textController1 ??= TextEditingController();
    _model.textFieldFocusNode1 ??= FocusNode();

    _model.emailTextController ??= TextEditingController();
    _model.textFieldFocusNode2 ??= FocusNode();

    _model.passwordTextController ??= TextEditingController();
    _model.textFieldFocusNode3 ??= FocusNode();

    _model.confirmPasswordTextController ??= TextEditingController();
    _model.textFieldFocusNode4 ??= FocusNode();
  }

  @override
  void dispose() {
    _model.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (!_agreedToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFFEF4444),
          behavior: SnackBarBehavior.floating,
          content: Text(
            'Precisas de aceitar os Termos de Serviço para continuar.',
            style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
          ),
        ),
      );
      return;
    }

    if (_model.passwordTextController.text != _model.confirmPasswordTextController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFFEF4444),
          behavior: SnackBarBehavior.floating,
          content: Text(
            'As palavras-passe não coincidem. Verifica e tenta novamente.',
            style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
          ),
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      GoRouter.of(context).prepareAuthEvent();

      final user = await authManager.createAccountWithEmail(
        context,
        _model.emailTextController.text.trim(),
        _model.passwordTextController.text,
      );

      if (!mounted) return;

      if (user != null) {
        try {
          await UsersRecord.collection.doc(user.uid).set(
            createUsersRecordData(
              displayName: _model.textController1.text.trim(),
              email: _model.emailTextController.text.trim(),
              isPromoter: true,
              subscriptionTier: 'free',
              eventsPublishedThisMonth: 0,
              createdTime: DateTime.now(),
            ),
          );
        } catch (_) {
          // If Firestore is mock or offline in web demo, continue smoothly
        }

        context.goNamedAuth(LotusAdminScreen.routeName, context.mounted);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
            content: Text(
              'Não foi possível criar a conta. Experimenta o "Registo Demo".',
              style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
            ),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFFEF4444),
          behavior: SnackBarBehavior.floating,
          content: Text(
            'Erro ao registar ($e). Podes utilizar o "Registo Demo".',
            style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
          ),
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _enterAsDemoPromoter() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF10B981),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
        content: Row(
          children: [
            const Icon(Icons.check_circle_outline, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Conta Promotor Freemium criada com sucesso (Modo Demo)',
                style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500),
              ),
            ),
          ],
        ),
      ),
    );

    context.goNamedAuth(LotusAdminScreen.routeName, context.mounted);
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final bool isWideScreen = screenWidth >= 960;

    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: bgPearl,
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  maxWidth: isWideScreen ? 1040 : 520,
                ),
                child: isWideScreen
                    ? _buildSplitLayout()
                    : _buildSingleCardLayout(),
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Two-column layout for desktop
  Widget _buildSplitLayout() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20.0),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 24,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Left Hero Column
            Expanded(
              flex: 5,
              child: _buildHeroBanner(),
            ),
            // Right Form Column
            Expanded(
              flex: 6,
              child: Padding(
                padding: const EdgeInsets.all(40.0),
                child: _buildRegisterForm(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Single card for compact screens
  Widget _buildSingleCardLayout() {
    return Container(
      padding: const EdgeInsets.all(28.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20.0),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildCompactHeader(),
          const SizedBox(height: 24.0),
          _buildRegisterForm(),
        ],
      ),
    );
  }

  /// Left column on wide screens
  Widget _buildHeroBanner() {
    return Container(
      padding: const EdgeInsets.all(44.0),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 6.0),
                decoration: BoxDecoration(
                  color: neonOrange.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(20.0),
                  border: Border.all(color: neonOrange.withValues(alpha: 0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: neonOrange,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'ADESÃO PROMOTOR',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                        color: neonOrange,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28.0),
              Text(
                'Leva os teus eventos ao público certo no Porto.',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  height: 1.25,
                ),
              ),
              const SizedBox(height: 16.0),
              Text(
                'Regista a tua organização ou espaço cultural. Junta-te aos melhores clubes, salas de concerto e produtores da cidade.',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: const Color(0xFF94A3B8),
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 36.0),

              // Steps
              _buildStepRow(
                number: '1',
                title: 'Registo Gratuito em 30 Segundos',
                subtitle: 'Sem fidelizações nem necessidade de cartão de crédito.',
              ),
              const SizedBox(height: 20.0),
              _buildStepRow(
                number: '2',
                title: 'Publica o 1º Evento do Mês',
                subtitle: 'Acede imediatamente à quota gratuita do plano Freemium.',
              ),
              const SizedBox(height: 20.0),
              _buildStepRow(
                number: '3',
                title: 'Mede o Impacto e Expande',
                subtitle: 'Analytics detalhados e upgrade para eventos ilimitados por apenas 5€/mês.',
              ),
            ],
          ),

          // Freemium guarantee pill
          Container(
            padding: const EdgeInsets.all(14.0),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(12.0),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Row(
              children: [
                const Icon(Icons.verified_outlined, color: Color(0xFF10B981), size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Garantia Lotus: 1 evento/mês incluído para sempre sem custos.',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFFCBD5E1),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepRow({
    required String number,
    required String title,
    required String subtitle,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 28,
          height: 28,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: neonOrange,
            borderRadius: BorderRadius.circular(8.0),
          ),
          child: Text(
            number,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: const Color(0xFF94A3B8),
                  height: 1.35,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCompactHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8.0),
              decoration: BoxDecoration(
                color: neonOrange.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10.0),
              ),
              child: const Icon(Icons.bolt_rounded, color: neonOrange, size: 24),
            ),
            const SizedBox(width: 10),
            Text(
              'LOTUS PROMOTER',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: textDark,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16.0),
        Text(
          'Criar Conta de Promotor',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: textDark,
          ),
        ),
        const SizedBox(height: 4.0),
        Text(
          'Publica eventos e acede ao radar cultural do Porto.',
          style: GoogleFonts.inter(
            fontSize: 13,
            color: textMuted,
          ),
        ),
      ],
    );
  }

  /// Form Implementation
  Widget _buildRegisterForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (MediaQuery.of(context).size.width >= 960) ...[
            Text(
              'Criar Conta de Promotor',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: textDark,
              ),
            ),
            const SizedBox(height: 6.0),
            Text(
              'Começa gratuitamente com 1 evento incluído por mês.',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: textMuted,
              ),
            ),
            const SizedBox(height: 24.0),
          ],

          // Nome do Espaço / Produtora
          Text(
            'Nome da Organização / Espaço',
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: textDark,
            ),
          ),
          const SizedBox(height: 6.0),
          TextFormField(
            controller: _model.textController1,
            focusNode: _model.textFieldFocusNode1,
            style: GoogleFonts.inter(fontSize: 14, color: textDark),
            decoration: InputDecoration(
              isDense: true,
              hintText: 'Ex: Plano B, Pérola Negra, Coletivo Som',
              hintStyle: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF9CA3AF)),
              prefixIcon: const Icon(Icons.business_rounded, color: textMuted, size: 18),
              filled: true,
              fillColor: const Color(0xFFFAFAFA),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 14.0),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: borderColor),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: borderColor),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: neonOrange, width: 1.5),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: Color(0xFFEF4444)),
              ),
            ),
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Por favor introduz o nome do espaço ou organização';
              }
              return null;
            },
          ),
          const SizedBox(height: 16.0),

          // Email Profissional
          Text(
            'Email Profissional',
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: textDark,
            ),
          ),
          const SizedBox(height: 6.0),
          TextFormField(
            controller: _model.emailTextController,
            focusNode: _model.textFieldFocusNode2,
            keyboardType: TextInputType.emailAddress,
            style: GoogleFonts.inter(fontSize: 14, color: textDark),
            decoration: InputDecoration(
              isDense: true,
              hintText: 'booking@teuespaco.pt',
              hintStyle: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF9CA3AF)),
              prefixIcon: const Icon(Icons.alternate_email_rounded, color: textMuted, size: 18),
              filled: true,
              fillColor: const Color(0xFFFAFAFA),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 14.0),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: borderColor),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: borderColor),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: neonOrange, width: 1.5),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: Color(0xFFEF4444)),
              ),
            ),
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Por favor introduz o teu email';
              }
              if (!value.contains('@') || !value.contains('.')) {
                return 'Introduz um endereço de email válido';
              }
              return null;
            },
          ),
          const SizedBox(height: 16.0),

          // Tipo de Promotor Chips
          Text(
            'Tipo de Promotor',
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: textDark,
            ),
          ),
          const SizedBox(height: 6.0),
          Wrap(
            spacing: 8.0,
            runSpacing: 8.0,
            children: _promoterTypes.map((type) {
              final isSelected = _selectedPromoterType == type;
              return ChoiceChip(
                label: Text(type),
                selected: isSelected,
                labelStyle: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  color: isSelected ? neonOrange : textDark,
                ),
                selectedColor: const Color(0xFFFFF7ED),
                backgroundColor: const Color(0xFFF9FAFB),
                side: BorderSide(
                  color: isSelected ? neonOrange : borderColor,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.0),
                ),
                onSelected: (selected) {
                  if (selected) {
                    setState(() => _selectedPromoterType = type);
                  }
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 16.0),

          // Palavra-passe
          Text(
            'Palavra-passe',
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: textDark,
            ),
          ),
          const SizedBox(height: 6.0),
          TextFormField(
            controller: _model.passwordTextController,
            focusNode: _model.textFieldFocusNode3,
            obscureText: !_model.passwordVisibility1,
            style: GoogleFonts.inter(fontSize: 14, color: textDark),
            decoration: InputDecoration(
              isDense: true,
              hintText: 'Mínimo de 6 caracteres',
              hintStyle: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF9CA3AF)),
              prefixIcon: const Icon(Icons.lock_outline_rounded, color: textMuted, size: 18),
              suffixIcon: IconButton(
                icon: Icon(
                  _model.passwordVisibility1
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                  color: textMuted,
                  size: 20,
                ),
                onPressed: () {
                  setState(() {
                    _model.passwordVisibility1 = !_model.passwordVisibility1;
                  });
                },
              ),
              filled: true,
              fillColor: const Color(0xFFFAFAFA),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 14.0),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: borderColor),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: borderColor),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: neonOrange, width: 1.5),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: Color(0xFFEF4444)),
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Por favor introduz a palavra-passe';
              }
              if (value.length < 6) {
                return 'A palavra-passe deve ter pelo menos 6 caracteres';
              }
              return null;
            },
          ),
          const SizedBox(height: 16.0),

          // Confirmar Palavra-passe
          Text(
            'Confirmar Palavra-passe',
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: textDark,
            ),
          ),
          const SizedBox(height: 6.0),
          TextFormField(
            controller: _model.confirmPasswordTextController,
            focusNode: _model.textFieldFocusNode4,
            obscureText: !_model.passwordVisibility2,
            style: GoogleFonts.inter(fontSize: 14, color: textDark),
            decoration: InputDecoration(
              isDense: true,
              hintText: 'Repete a palavra-passe',
              hintStyle: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF9CA3AF)),
              prefixIcon: const Icon(Icons.lock_reset_rounded, color: textMuted, size: 18),
              suffixIcon: IconButton(
                icon: Icon(
                  _model.passwordVisibility2
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                  color: textMuted,
                  size: 20,
                ),
                onPressed: () {
                  setState(() {
                    _model.passwordVisibility2 = !_model.passwordVisibility2;
                  });
                },
              ),
              filled: true,
              fillColor: const Color(0xFFFAFAFA),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 14.0),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: borderColor),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: borderColor),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: neonOrange, width: 1.5),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10.0),
                borderSide: const BorderSide(color: Color(0xFFEF4444)),
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Por favor confirma a palavra-passe';
              }
              if (value != _model.passwordTextController.text) {
                return 'As palavras-passe não coincidem';
              }
              return null;
            },
          ),
          const SizedBox(height: 14.0),

          // Plan guarantee notice
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
            decoration: BoxDecoration(
              color: const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(8.0),
              border: Border.all(color: borderColor),
            ),
            child: Row(
              children: [
                const Icon(Icons.card_giftcard_rounded, color: neonOrange, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Atribuição automática do Plano Freemium: 1 evento gratuito/mês.',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: textDark,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14.0),

          // Terms Checkbox
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 24,
                width: 24,
                child: Checkbox(
                  value: _agreedToTerms,
                  activeColor: neonOrange,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4.0),
                  ),
                  onChanged: (val) {
                    setState(() => _agreedToTerms = val ?? true);
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Concordo com os Termos de Serviço e a Política de Privacidade do Lotus Promoter.',
                  style: GoogleFonts.inter(fontSize: 12, color: textMuted, height: 1.3),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20.0),

          // Submit Button
          SizedBox(
            height: 48,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _handleRegister,
              style: ElevatedButton.styleFrom(
                backgroundColor: neonOrange,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10.0),
                ),
              ),
              child: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Criar Conta e Aceder ao Painel',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.rocket_launch_rounded, size: 16),
                        ],
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 12.0),

          // Quick Demo Bypass
          SizedBox(
            height: 44,
            child: OutlinedButton(
              onPressed: _enterAsDemoPromoter,
              style: OutlinedButton.styleFrom(
                backgroundColor: const Color(0xFFFFF7ED),
                side: const BorderSide(color: Color(0xFFFDBA74)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10.0),
                ),
              ),
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.bolt_rounded, color: neonOrange, size: 18),
                    const SizedBox(width: 6),
                    Text(
                      'Testar Registo Rápido Demo',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFFC2410C),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 24.0),

          // Footer link to Login
          Wrap(
            alignment: WrapAlignment.center,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(
                'Já tens uma conta de promotor? ',
                style: GoogleFonts.inter(fontSize: 13, color: textMuted),
              ),
              InkWell(
                onTap: () {
                  context.pushNamed(LoginWidget.routeName);
                },
                child: Text(
                  'Iniciar Sessão',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: neonOrange,
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
