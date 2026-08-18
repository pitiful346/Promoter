import '/components/button/button_widget.dart';
import '/components/main_sidebar/main_sidebar_widget.dart';
import '/components/metric_card/metric_card_widget.dart';
import '/components/payout_row/payout_row_widget.dart';
import '/components/tab_group/tab_group_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'financial_reports_widget.dart' show FinancialReportsWidget;
import 'package:flutter/material.dart';

class FinancialReportsModel extends FlutterFlowModel<FinancialReportsWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for MainSidebar.
  late MainSidebarModel mainSidebarModel;
  // Model for Button.
  late ButtonModel buttonModel1;
  // Model for Button.
  late ButtonModel buttonModel2;
  // Model for MetricCard.
  late MetricCardModel metricCardModel1;
  // Model for MetricCard.
  late MetricCardModel metricCardModel2;
  // Model for MetricCard.
  late MetricCardModel metricCardModel3;
  // Model for TabGroup.
  late TabGroupModel tabGroupModel;
  // Model for PayoutRow.
  late PayoutRowModel payoutRowModel1;
  // Model for PayoutRow.
  late PayoutRowModel payoutRowModel2;
  // Model for PayoutRow.
  late PayoutRowModel payoutRowModel3;
  // Model for PayoutRow.
  late PayoutRowModel payoutRowModel4;
  // Model for Button.
  late ButtonModel buttonModel3;

  @override
  void initState(BuildContext context) {
    mainSidebarModel = createModel(context, () => MainSidebarModel());
    buttonModel1 = createModel(context, () => ButtonModel());
    buttonModel2 = createModel(context, () => ButtonModel());
    metricCardModel1 = createModel(context, () => MetricCardModel());
    metricCardModel2 = createModel(context, () => MetricCardModel());
    metricCardModel3 = createModel(context, () => MetricCardModel());
    tabGroupModel = createModel(context, () => TabGroupModel());
    payoutRowModel1 = createModel(context, () => PayoutRowModel());
    payoutRowModel2 = createModel(context, () => PayoutRowModel());
    payoutRowModel3 = createModel(context, () => PayoutRowModel());
    payoutRowModel4 = createModel(context, () => PayoutRowModel());
    buttonModel3 = createModel(context, () => ButtonModel());
  }

  @override
  void dispose() {
    mainSidebarModel.dispose();
    buttonModel1.dispose();
    buttonModel2.dispose();
    metricCardModel1.dispose();
    metricCardModel2.dispose();
    metricCardModel3.dispose();
    tabGroupModel.dispose();
    payoutRowModel1.dispose();
    payoutRowModel2.dispose();
    payoutRowModel3.dispose();
    payoutRowModel4.dispose();
    buttonModel3.dispose();
  }
}
