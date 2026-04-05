// tool/generate_data.dart
import 'dart:io';

void main() {
  // Read portfolio.json
  final file = File('data/portfolio.json');
  if (!file.existsSync()) {
    print('Error: data/portfolio.json not found!');
    exit(1);
  }
  
  final jsonString = file.readAsStringSync();
  
  // Make sure output dir exists
  final outDir = Directory('lib/data');
  if (!outDir.existsSync()) {
    outDir.createSync(recursive: true);
  }

  // Generate Dart file
  final outContent = '''// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Run `dart run tool/generate_data.dart` to update this file.

/// The raw JSON data from data/portfolio.json
const String portfolioDataRaw = r\'\'\'
$jsonString\'\'\';
''';

  final outFile = File('lib/data/portfolio_static.dart');
  outFile.writeAsStringSync(outContent);
  print('Generated lib/data/portfolio_static.dart successfully.');
}
