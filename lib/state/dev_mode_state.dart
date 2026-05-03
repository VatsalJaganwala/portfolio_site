import 'package:jaspr/jaspr.dart';
import 'console_log_controller.dart';

class DevModeState extends InheritedComponent {
  final bool isDevMode;
  final bool isTransitioning;
  final void Function() enterDevMode;
  final void Function() exitDevMode;
  final ConsoleLogController console;

  const DevModeState({
    required this.isDevMode,
    required this.isTransitioning,
    required this.enterDevMode,
    required this.exitDevMode,
    required this.console,
    required super.child,
  });

  static DevModeState of(BuildContext context) =>
      context.dependOnInheritedComponentOfExactType<DevModeState>()!;

  @override
  bool updateShouldNotify(DevModeState old) =>
      old.isDevMode != isDevMode || old.isTransitioning != isTransitioning;
}
