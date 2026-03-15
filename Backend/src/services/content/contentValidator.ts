import Joi from 'joi';
import logger from '../../utils/logger';

// Content type schemas
const ImageContent = Joi.object({
  type: Joi.string().valid('image').required(),
  url: Joi.string().uri().required(),
  alt: Joi.string().required(),
  caption: Joi.string().optional(),
});

const VideoContent = Joi.object({
  type: Joi.string().valid('video').required(),
  url: Joi.string().uri().required(),
  provider: Joi.string().valid('youtube', 'vimeo').required(),
  duration: Joi.number().required(),
});

const CodeContent = Joi.object({
  type: Joi.string().valid('code').required(),
  language: Joi.string().required(),
  code: Joi.string().required(),
  explanation: Joi.string().optional(),
});

const TextContent = Joi.object({
  type: Joi.string().valid('text').required(),
  content: Joi.string().required(),
  format: Joi.string().valid('markdown', 'plain').required(),
});

const ContentSchema = Joi.alternatives().try(
  ImageContent,
  VideoContent,
  CodeContent,
  TextContent
);

export class ContentValidator {
  static validate(content: unknown) {
    const { error, value } = ContentSchema.validate(content);

    if (error) {
      logger.error('Content validation failed:', error);
      throw error;
    }

    return value;
  }

  static validateBatch(contents: unknown[]) {
    return contents.map((content) => this.validate(content));
  }
}
