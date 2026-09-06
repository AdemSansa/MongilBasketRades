import 'package:flutter/material.dart';

/// Basketball-orange brand seed; swap for the academy's real brand color
/// once one is chosen.
const _seedColor = Color(0xFFE65100);

final appTheme = ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(seedColor: _seedColor),
  inputDecorationTheme: const InputDecorationTheme(
    border: OutlineInputBorder(),
  ),
);
