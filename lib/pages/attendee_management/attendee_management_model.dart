import '/components/attendee_row/attendee_row_widget.dart';
import '/components/button/button_widget.dart';
import '/components/main_sidebar/main_sidebar_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'attendee_management_widget.dart' show AttendeeManagementWidget;
import 'package:flutter/material.dart';

class AttendeeManagementModel
    extends FlutterFlowModel<AttendeeManagementWidget> {
  ///  State fields for stateful widgets in this page.

  // Model for MainSidebar.
  late MainSidebarModel mainSidebarModel;
  // Model for Button.
  late ButtonModel buttonModel1;
  // Model for AttendeeRow.
  late AttendeeRowModel attendeeRowModel1;
  // Model for AttendeeRow.
  late AttendeeRowModel attendeeRowModel2;
  // Model for AttendeeRow.
  late AttendeeRowModel attendeeRowModel3;
  // Model for AttendeeRow.
  late AttendeeRowModel attendeeRowModel4;
  // Model for AttendeeRow.
  late AttendeeRowModel attendeeRowModel5;
  // Model for AttendeeRow.
  late AttendeeRowModel attendeeRowModel6;
  // Model for AttendeeRow.
  late AttendeeRowModel attendeeRowModel7;
  // Model for AttendeeRow.
  late AttendeeRowModel attendeeRowModel8;
  // Model for Button.
  late ButtonModel buttonModel2;
  // Model for Button.
  late ButtonModel buttonModel3;

  @override
  void initState(BuildContext context) {
    mainSidebarModel = createModel(context, () => MainSidebarModel());
    buttonModel1 = createModel(context, () => ButtonModel());
    attendeeRowModel1 = createModel(context, () => AttendeeRowModel());
    attendeeRowModel2 = createModel(context, () => AttendeeRowModel());
    attendeeRowModel3 = createModel(context, () => AttendeeRowModel());
    attendeeRowModel4 = createModel(context, () => AttendeeRowModel());
    attendeeRowModel5 = createModel(context, () => AttendeeRowModel());
    attendeeRowModel6 = createModel(context, () => AttendeeRowModel());
    attendeeRowModel7 = createModel(context, () => AttendeeRowModel());
    attendeeRowModel8 = createModel(context, () => AttendeeRowModel());
    buttonModel2 = createModel(context, () => ButtonModel());
    buttonModel3 = createModel(context, () => ButtonModel());
  }

  @override
  void dispose() {
    mainSidebarModel.dispose();
    buttonModel1.dispose();
    attendeeRowModel1.dispose();
    attendeeRowModel2.dispose();
    attendeeRowModel3.dispose();
    attendeeRowModel4.dispose();
    attendeeRowModel5.dispose();
    attendeeRowModel6.dispose();
    attendeeRowModel7.dispose();
    attendeeRowModel8.dispose();
    buttonModel2.dispose();
    buttonModel3.dispose();
  }
}
