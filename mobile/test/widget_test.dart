import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:mobile/app/app.dart';

void main() {
  testWidgets('shows the login screen on launch', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(child: MongilBasketRadesApp()),
    );
    await tester.pumpAndSettle();

    expect(find.text('Mongil Basket Rades'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, 'Email'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, 'Password'), findsOneWidget);
  });
}
