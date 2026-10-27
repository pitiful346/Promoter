import '/auth/firebase_auth/auth_util.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'login_model.dart';
export 'login_model.dart';

class LoginWidget extends StatefulWidget {
  const LoginWidget({super.key});

  static String routeName = 'Login';
  static String routePath = '/login';

  @override
  State<LoginWidget> createState() => _LoginWidgetState();
}

class _LoginWidgetState extends State<LoginWidget> {
  late LoginModel _model;
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  bool _isLoading = false;
  bool _rememberMe = true;

  static const Color neonOrange = Color(0xFFFF5E00);
  static const Color bgPearl = Color(0xFFF3F4F6);
  static const Color textDark = Color(0xFF111827);
  static const Color textMuted = Color(0xFF6B7280);
  static const Color borderColor = Color(0xFFE5E7EB);

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => LoginModel());

    _model.emailTextController ??= TextEditingController();
    _model.textFieldFocusNode1 ??= FocusNode();

    _model.passwordTextController ??= TextEditingController();
    _model.textFieldFocusNode2 ??= FocusNode();
  }

  @override
  void dispose() {
    _model.dispose();
    super.dispose();
  }

  Future<void> _handleEmailLogin() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isLoading = true);

    try {
      GoRouter.of(context).prepareAuthEvent();

      final user = await authManager.signInWithEmail(
        context,
        _model.emailTextController.text.trim(),
        _model.passwordTextController.text,
      );

      if (!mounted) return;

      if (user != null) {
        context.goNamedAuth(LotusAdminScreen.routeName, context.mounted);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
            content: Text(
              'Credenciais incorretas ou utilizador não encontrado. Podes também usar o "Acesso Demo".',
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
            'Erro ao iniciar sessão ($e). Experimenta o "Acesso Demo".',
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
    // Immediate bypass for rapid testing/evaluations and demo presentations
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
                'Sessão iniciada como Promotor Demo (Porto Cult Club)',
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
                  maxWidth: isWideScreen ? 1040 : 480,
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

  /// Two-column layout for desktop / tablet landscapes
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
            // Left Hero Showcase Column
            Expanded(
              flex: 5,
              child: _buildHeroBanner(),
            ),
            // Right Form Column
            Expanded(
              flex: 6,
              child: Padding(
                padding: const EdgeInsets.all(40.0),
                child: _buildLoginForm(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Single centered card layout for mobile / compact screens
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
          _buildLoginForm(),
        ],
      ),
    );
  }

  /// Left column on wide screens showcasing the brand and value proposition
  Widget _buildHeroBanner() {
    return Container(
      padding: const EdgeInsets.all(44.0),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A), // Dark slate tech backdrop
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Brand badge
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
                      'LOTUS PROMOTER B2B',
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
                'O radar cultural do Porto na ponta dos teus dedos.',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  height: 1.25,
                ),
              ),
              const SizedBox(height: 16.0),
              Text(
                'A plataforma oficial de gestão de eventos para espaços noturnos, promotores, teatros e coletivos culturais no Grande Porto.',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: const Color(0xFF94A3B8),
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 36.0),

              // Feature Highlights
              _buildFeatureRow(
                icon: Icons.map_rounded,
                title: 'Radar Geolocalizado',
                subtitle: 'Visibilidade direta no mapa para milhares de utilizadores ativos.',
              ),
              const SizedBox(height: 20.0),
              _buildFeatureRow(
                icon: Icons.insights_rounded,
                title: 'Analytics em Tempo Real',
                subtitle: 'Mede cliques no mapa, adições a planos e interesse por zona.',
              ),
              const SizedBox(height: 20.0),
              _buildFeatureRow(
                icon: Icons.confirmation_number_outlined,
                title: 'Plano Freemium Vitalício',
                subtitle: 'Publica 1 evento gratuito todos os meses sem fidelização.',
              ),
            ],
          ),

          // Bottom social proof pill
          Container(
            padding: const EdgeInsets.all(14.0),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(12.0),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Row(
              children: [
                const Icon(Icons.local_fire_department_rounded, color: neonOrange, size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    '+35 eventos já promovidos este mês no Porto e Matosinhos.',
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

  Widget _buildFeatureRow({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8.0),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(8.0),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: Icon(icon, color: neonOrange, size: 18),
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

  /// Compact header for mobile
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
          'Bem-vindo de volta',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: textDark,
          ),
        ),
        const SizedBox(height: 4.0),
        Text(
          'Inicia sessão para gerir os teus eventos no Porto.',
          style: GoogleFonts.inter(
            fontSize: 13,
            color: textMuted,
          ),
        ),
      ],
    );
  }

  /// Main Login Form
  Widget _buildLoginForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // On wide screens, add top header
          if (MediaQuery.of(context).size.width >= 960) ...[
            Text(
              'Iniciar Sessão',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: textDark,
              ),
            ),
            const SizedBox(height: 6.0),
            Text(
              'Introduz as tuas credenciais para aceder ao painel.',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: textMuted,
              ),
            ),
            const SizedBox(height: 28.0),
          ],

          // Email Field
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
            focusNode: _model.textFieldFocusNode1,
            keyboardType: TextInputType.emailAddress,
            style: GoogleFonts.inter(fontSize: 14, color: textDark),
            decoration: InputDecoration(
              isDense: true,
              hintText: 'promotor@teuespaco.pt',
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
          const SizedBox(height: 18.0),

          // Password Field
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Palavra-passe',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: textDark,
                ),
              ),
              TextButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        'Enviámos um link de recuperação para o teu email se este estiver registado.',
                        style: GoogleFonts.inter(fontSize: 13),
                      ),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  'Esqueceste a senha?',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: neonOrange,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6.0),
          TextFormField(
            controller: _model.passwordTextController,
            focusNode: _model.textFieldFocusNode2,
            obscureText: !_model.passwordVisibility,
            style: GoogleFonts.inter(fontSize: 14, color: textDark),
            decoration: InputDecoration(
              isDense: true,
              hintText: '••••••••',
              hintStyle: GoogleFonts.inter(fontSize: 13, color: const Color(0xFF9CA3AF)),
              prefixIcon: const Icon(Icons.lock_outline_rounded, color: textMuted, size: 18),
              suffixIcon: IconButton(
                icon: Icon(
                  _model.passwordVisibility
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                  color: textMuted,
                  size: 20,
                ),
                onPressed: () {
                  setState(() {
                    _model.passwordVisibility = !_model.passwordVisibility;
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
          const SizedBox(height: 12.0),

          // Remember Me Checkbox
          Row(
            children: [
              SizedBox(
                height: 24,
                width: 24,
                child: Checkbox(
                  value: _rememberMe,
                  activeColor: neonOrange,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4.0),
                  ),
                  onChanged: (val) {
                    setState(() => _rememberMe = val ?? true);
                  },
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Lembrar-me neste dispositivo',
                style: GoogleFonts.inter(fontSize: 12, color: textMuted),
              ),
            ],
          ),
          const SizedBox(height: 20.0),

          // Primary Submit Button
          SizedBox(
            height: 48,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _handleEmailLogin,
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
                            'Iniciar Sessão',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.arrow_forward_rounded, size: 16),
                        ],
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 12.0),

          // Quick Demo Bypass Button
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
                      'Entrar como Promotor Demo',
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

          // Separator
          Row(
            children: [
              const Expanded(child: Divider(color: borderColor)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12.0),
                child: Text(
                  'OU',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: textMuted,
                  ),
                ),
              ),
              const Expanded(child: Divider(color: borderColor)),
            ],
          ),
          const SizedBox(height: 20.0),

          // Social Auth Buttons (Google & Apple Mock)
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () async {
                    // Google Auth Attempt / Demo Fallback
                    GoRouter.of(context).prepareAuthEvent();
                    final user = await authManager.signInWithGoogle(context);
                    if (!mounted) return;
                    if (user != null) {
                      context.goNamedAuth(LotusAdminScreen.routeName, context.mounted);
                    } else {
                      _enterAsDemoPromoter();
                    }
                  },
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    side: const BorderSide(color: borderColor),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.g_mobiledata_rounded, size: 24, color: textDark),
                      const SizedBox(width: 4),
                      Text(
                        'Google',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: textDark,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12.0),
              Expanded(
                child: OutlinedButton(
                  onPressed: () async {
                    // Apple Auth Attempt / Demo Fallback
                    GoRouter.of(context).prepareAuthEvent();
                    final user = await authManager.signInWithApple(context);
                    if (!mounted) return;
                    if (user != null) {
                      context.goNamedAuth(LotusAdminScreen.routeName, context.mounted);
                    } else {
                      _enterAsDemoPromoter();
                    }
                  },
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    side: const BorderSide(color: borderColor),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.apple_rounded, size: 20, color: textDark),
                      const SizedBox(width: 4),
                      Text(
                        'Apple',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: textDark,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 28.0),

          // Footer link to Register
          Wrap(
            alignment: WrapAlignment.center,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(
                'Ainda não és promotor? ',
                style: GoogleFonts.inter(fontSize: 13, color: textMuted),
              ),
              InkWell(
                onTap: () {
                  context.pushNamed(RegisterWidget.routeName);
                },
                child: Text(
                  'Criar Conta',
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
