import Joi from 'joi';

export const userSearchSchema = Joi.object({
  query: Joi.string().optional().default(''),
  role: Joi.string().optional().default(''),
});

export const configUpdateSchema = Joi.object({
  key: Joi.string().required(),
  value: Joi.any().required(),
});

export const resourceAllocationSchema = Joi.object({
  resourceType: Joi.string().valid('storage', 'compute', 'network').required(),
  resourceId: Joi.string().required(),
  allocation: Joi.number().positive().required(),
});

export const reportConfigSchema = Joi.object({
  type: Joi.string().valid('user', 'platform').required(),
  id: Joi.string().optional(),
  dateRange: Joi.object({
    start: Joi.date().required(),
    end: Joi.date().min(Joi.ref('start')).required(),
  }).optional(),
});
