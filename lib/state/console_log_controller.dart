enum LogLevel { info, debug, warning, error, command }

class LogEntry {
  final LogLevel level;
  final String message;
  final String timestamp;
  final bool isCommand;

  LogEntry({
    required this.level,
    required this.message,
    required this.timestamp,
    this.isCommand = false,
  });
}

class ConsoleLogController {
  final List<LogEntry> entries = [];
  void Function()? onUpdate;

  void addLog(LogLevel level, String message) {
    final now = DateTime.now();
    final ts = '${now.hour.toString().padLeft(2, '0')}:'
        '${now.minute.toString().padLeft(2, '0')}:'
        '${now.second.toString().padLeft(2, '0')}';
    entries.add(LogEntry(level: level, message: message, timestamp: ts));
    onUpdate?.call();
  }

  void addCommand(String command) {
    entries.add(LogEntry(
      level: LogLevel.command,
      message: command,
      timestamp: '',
      isCommand: true,
    ));
    onUpdate?.call();
  }

  void clear() {
    entries.clear();
    onUpdate?.call();
  }
}
