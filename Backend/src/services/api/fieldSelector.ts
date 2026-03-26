import { Prisma } from '@prisma/client';

interface FieldSelection {
  fields?: string[];
  include?: Record<string, boolean | FieldSelection>;
}

export class FieldSelector {
  static buildSelect(selection: FieldSelection): Prisma.JsonObject {
    const select: Record<string, unknown> = {};

    // Handle basic field selection
    if (selection.fields) {
      for (const field of selection.fields) {
        select[field] = true;
      }
    }

    // Handle nested selections
    if (selection.include) {
      for (const [relation, value] of Object.entries(selection.include)) {
        if (typeof value === 'boolean') {
          select[relation] = value;
        } else {
          select[relation] = {
            select: this.buildSelect(value),
          };
        }
      }
    }

    return select as Prisma.JsonObject;
  }

  static validateSelection(
    selection: FieldSelection,
    allowedFields: Set<string>,
    allowedRelations: Set<string>
  ): boolean {
    // Validate basic fields
    if (selection.fields) {
      for (const field of selection.fields) {
        if (!allowedFields.has(field)) {
          return false;
        }
      }
    }

    // Validate relations
    if (selection.include) {
      for (const relation of Object.keys(selection.include)) {
        if (!allowedRelations.has(relation)) {
          return false;
        }
      }
    }

    return true;
  }
}
