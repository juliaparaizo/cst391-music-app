import * as rulesRepo from '@/lib/repositories/rulesRepository';
import type { Rule } from '@/lib/types';

export async function listRules(): Promise<Rule[]> {
  return rulesRepo.getAllRules();
}

export async function getRule(id: number): Promise<Rule | null> {
  return rulesRepo.getRuleById(id);
}

export async function createRule(
  name: string,
  criteria_field: string,
  criteria_value: string,
  created_by: string,
  role_required: string
): Promise<{ id: number }> {
  if (!name || !criteria_field || !criteria_value) {
    throw new Error('name, criteria_field, and criteria_value are required');
  }
  const validFields = ['artist', 'year', 'title'];
  if (!validFields.includes(criteria_field)) {
    throw new Error(`criteria_field must be one of: ${validFields.join(', ')}`);
  }
  return rulesRepo.createRule(name, criteria_field, criteria_value, created_by, role_required || 'admin');
}

export async function updateRule(
  id: number,
  name: string,
  criteria_field: string,
  criteria_value: string,
  role_required: string
): Promise<Rule> {
  if (!name || !criteria_field || !criteria_value) {
    throw new Error('name, criteria_field, and criteria_value are required');
  }
  const updated = await rulesRepo.updateRule(id, name, criteria_field, criteria_value, role_required || 'admin');
  if (!updated) throw new Error('Rule not found');
  return updated;
}

export async function deleteRule(id: number): Promise<void> {
  const deleted = await rulesRepo.deleteRule(id);
  if (!deleted) throw new Error('Rule not found');
}
