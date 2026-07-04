import 'dart:io';
import 'dart:convert';

void main() async {
  final client = HttpClient();
  try {
    print('Fetching http://localhost:8080...');
    final request = await client.getUrl(Uri.parse('http://localhost:8080'));
    final response = await request.close();
    print('Response status: ${response.statusCode}');
    final body = await response.transform(utf8.decoder).join();
    final file = File('tmp_response_utf8.html');
    await file.writeAsString(body);
    print('Response saved to tmp_response_utf8.html, length: ${body.length}');
  } catch (e) {
    print('Error: $e');
  } finally {
    client.close();
  }
}
