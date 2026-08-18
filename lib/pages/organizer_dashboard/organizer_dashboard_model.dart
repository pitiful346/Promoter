import '/components/button/button_widget.dart';
import '/components/event_card/event_card_widget.dart';
import '/components/main_sidebar/main_sidebar_widget.dart';
import '/components/metric_card/metric_card_widget.dart';
import '/components/tab_group/tab_group_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'organizer_dashboard_widget.dart' show OrganizerDashboardWidget;
import 'package:flutter/material.dart';

class OrganizerDashboardModel
    extends FlutterFlowModel<OrganizerDashboardWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for MainSidebar.
  late MainSidebarModel mainSidebarModel;
  // Model for Button.
  late ButtonModel buttonModel1;
  // Model for MetricCard.
  late MetricCardModel metricCardModel1;
  // Model for MetricCard.
  late MetricCardModel metricCardModel2;
  // Model for MetricCard.
  late MetricCardModel metricCardModel3;
  // Model for MetricCard.
  late MetricCardModel metricCardModel4;
  // Model for TabGroup.
  late TabGroupModel tabGroupModel;
  // Model for Button.
  late ButtonModel buttonModel2;
  // Models for EventCard.
  late FlutterFlowDynamicModels<EventCardModel> eventCardModels;

  @override
  void initState(BuildContext context) {
    mainSidebarModel = createModel(context, () => MainSidebarModel());
    buttonModel1 = createModel(context, () => ButtonModel());
    metricCardModel1 = createModel(context, () => MetricCardModel());
    metricCardModel2 = createModel(context, () => MetricCardModel());
    metricCardModel3 = createModel(context, () => MetricCardModel());
    metricCardModel4 = createModel(context, () => MetricCardModel());
    tabGroupModel = createModel(context, () => TabGroupModel());
    buttonModel2 = createModel(context, () => ButtonModel());
    eventCardModels = FlutterFlowDynamicModels(() => EventCardModel());
  }

  @override
  void dispose() {
    mainSidebarModel.dispose();
    buttonModel1.dispose();
    metricCardModel1.dispose();
    metricCardModel2.dispose();
    metricCardModel3.dispose();
    metricCardModel4.dispose();
    tabGroupModel.dispose();
    buttonModel2.dispose();
    eventCardModels.dispose();
  }
}
