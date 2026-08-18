import '/components/button/button_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'attendee_row_widget.dart' show AttendeeRowWidget;
import 'package:flutter/material.dart';

class AttendeeRowModel extends FlutterFlowModel<AttendeeRowWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for Button.
  late ButtonModel buttonModel;

  @override
  void initState(BuildContext context) {
    buttonModel = createModel(context, () => ButtonModel());
  }

  @override
  void dispose() {
    buttonModel.dispose();
  }
}
