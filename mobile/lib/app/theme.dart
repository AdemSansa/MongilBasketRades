import 'package:flutter/material.dart';

/// Mongil Basket Rades brand colors, taken from the club's Facebook page
/// (logo + weekly training-schedule graphics): navy blue and orange on a
/// white/dark-navy ground. See docs/architecture/navigation.md for where
/// this is used.
const _brandNavy = Color(0xFF12294D);
const _brandOrange = Color(0xFFF5821F);

final appTheme = ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: _brandNavy,
    primary: _brandNavy,
    secondary: _brandOrange,
  ),
  appBarTheme: const AppBarTheme(
    backgroundColor: _brandNavy,
    foregroundColor: Colors.white,
  ),
  filledButtonTheme: FilledButtonThemeData(
    style: FilledButton.styleFrom(
      backgroundColor: _brandOrange,
      foregroundColor: Colors.white,
    ),
  ),
  inputDecorationTheme: const InputDecorationTheme(
    border: OutlineInputBorder(),
    focusedBorder: OutlineInputBorder(
      borderSide: BorderSide(color: _brandOrange, width: 2),
    ),
  ),
);
