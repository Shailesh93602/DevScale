import Joi from 'joi';

// Shared by POST /quiz/submit and POST /topics/quiz/submit. One answer per
// question: the repository also deduplicates, but rejecting here gives the
// client a 400 instead of a silently ignored duplicate.
export const submitQuizSchema = Joi.object({
  quiz_id: Joi.string().required(),
  answers: Joi.array()
    .items(
      Joi.object({
        question_id: Joi.string().required(),
        answer: Joi.string().allow('').max(20000).required(),
      })
    )
    .unique('question_id')
    .max(500)
    .required(),
  time_spent: Joi.number().integer().min(0).optional(),
});
