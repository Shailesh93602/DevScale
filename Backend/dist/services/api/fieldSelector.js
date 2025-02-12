"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldSelector = void 0;
class FieldSelector {
    static buildSelect(selection) {
        const select = {};
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
                }
                else {
                    select[relation] = {
                        select: this.buildSelect(value),
                    };
                }
            }
        }
        return select;
    }
    static validateSelection(selection, allowedFields, allowedRelations) {
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
exports.FieldSelector = FieldSelector;
//# sourceMappingURL=fieldSelector.js.map