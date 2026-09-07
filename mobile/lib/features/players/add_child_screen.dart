import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/primary_button.dart';
import 'players_controller.dart';

class AddChildScreen extends ConsumerStatefulWidget {
  const AddChildScreen({super.key});

  @override
  ConsumerState<AddChildScreen> createState() => _AddChildScreenState();
}

class _AddChildScreenState extends ConsumerState<AddChildScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emergencyNameController = TextEditingController();
  final _emergencyPhoneController = TextEditingController();

  DateTime? _dateOfBirth;
  String? _gender;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emergencyNameController.dispose();
    _emergencyPhoneController.dispose();
    super.dispose();
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 10),
      firstDate: DateTime(now.year - 18),
      lastDate: now,
      helpText: 'Date of birth',
    );
    if (picked != null) {
      setState(() => _dateOfBirth = picked);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_dateOfBirth == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a date of birth')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      await ref.read(myChildrenControllerProvider.notifier).addChild(
            firstName: _firstNameController.text.trim(),
            lastName: _lastNameController.text.trim(),
            dateOfBirth: _dateOfBirth!,
            gender: _gender,
            emergencyContactName: _emergencyNameController.text.trim().isEmpty
                ? null
                : _emergencyNameController.text.trim(),
            emergencyContactPhone: _emergencyPhoneController.text.trim().isEmpty
                ? null
                : _emergencyPhoneController.text.trim(),
          );
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Child')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AppTextField(
                  label: 'First name',
                  controller: _firstNameController,
                  validator: (value) =>
                      (value == null || value.trim().isEmpty) ? 'First name is required' : null,
                ),
                const SizedBox(height: 16),
                AppTextField(
                  label: 'Last name',
                  controller: _lastNameController,
                  validator: (value) =>
                      (value == null || value.trim().isEmpty) ? 'Last name is required' : null,
                ),
                const SizedBox(height: 16),
                InkWell(
                  onTap: _pickDateOfBirth,
                  child: InputDecorator(
                    decoration: const InputDecoration(
                      labelText: 'Date of birth',
                      border: OutlineInputBorder(),
                    ),
                    child: Text(
                      _dateOfBirth == null
                          ? 'Select date'
                          : '${_dateOfBirth!.year}-${_dateOfBirth!.month.toString().padLeft(2, '0')}-${_dateOfBirth!.day.toString().padLeft(2, '0')}',
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  initialValue: _gender,
                  decoration: const InputDecoration(
                    labelText: 'Gender (optional)',
                    border: OutlineInputBorder(),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'MALE', child: Text('Male')),
                    DropdownMenuItem(value: 'FEMALE', child: Text('Female')),
                  ],
                  onChanged: (value) => setState(() => _gender = value),
                ),
                const SizedBox(height: 16),
                AppTextField(
                  label: 'Emergency contact name (optional)',
                  controller: _emergencyNameController,
                ),
                const SizedBox(height: 16),
                AppTextField(
                  label: 'Emergency contact phone (optional)',
                  controller: _emergencyPhoneController,
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 24),
                PrimaryButton(
                  label: 'Save',
                  isLoading: _isSubmitting,
                  onPressed: _submit,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
