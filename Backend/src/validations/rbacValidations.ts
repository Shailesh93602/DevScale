import Joi from 'joi';

export const roleSchema = Joi.object({
  name: Joi.string().required().min(3).max(50),
  description: Joi.string(),
  permissions: Joi.array().items(Joi.string()),
  parentId: Joi.string(),
});

export const permissionSchema = Joi.object({
  name: Joi.string().required().min(3).max(50),
  description: Joi.string(),
  resource: Joi.string().required(),
  action: Joi.string().required(),
  conditions: Joi.object(),
});

export const roleAssignmentSchema = Joi.object({
  userId: Joi.string().required(),
  roleId: Joi.string().required(),
});
