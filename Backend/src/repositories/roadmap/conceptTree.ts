import prisma from '../../lib/prisma.js';

/** Fetches a roadmap's whole concept → subject → topic tree in one query. */
export function fetchConceptTree(id: string) {
  // JSON aggregation offloads the heavy JOINs and array grouping to Postgres (written in C) instead of
  // transferring thousands of flattened rows to Node.js for Prisma to group.
  return prisma.$queryRaw<{ main_concepts: unknown }[]>`
    SELECT 
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'main_concept', jsonb_build_object(
              'id', mc.id,
              'name', mc.name,
              'description', mc.description,
              'order', mc."order",
              'subjects', (
                SELECT COALESCE(
                  jsonb_agg(
                    jsonb_build_object(
                      'id', rs.id,
                      'order', rs."order",
                      'subject', jsonb_build_object(
                        'id', s.id,
                        'title', s.title,
                        'description', s.description,
                        'order', s."order",
                        'topics', (
                          SELECT COALESCE(
                            jsonb_agg(
                              jsonb_build_object(
                                'id', rt.id,
                                'order', rt."order",
                                'topic', jsonb_build_object(
                                  'id', t.id,
                                  'title', t.title,
                                  'description', t.description,
                                  'order', t."order",
                                  '_count', jsonb_build_object(
                                    'articles', (SELECT count(*) FROM "Article" WHERE "Article".topic_id = t.id),
                                    'quizzes', (SELECT count(*) FROM "Quiz" WHERE "Quiz".topic_id = t.id),
                                    'challenges', (SELECT count(*) FROM "Challenge" WHERE "Challenge".topic_id = t.id)
                                  )
                                )
                              ) ORDER BY rt."order" ASC
                            ), '[]'::jsonb)
                          FROM "SubjectTopic" rt
                          JOIN "Topic" t ON t.id = rt.topic_id
                          WHERE rt.subject_id = s.id
                        )
                      )
                    ) ORDER BY rs."order" ASC
                  ), '[]'::jsonb) FROM "MainConceptSubject" rs
                JOIN "Subject" s ON s.id = rs.subject_id
                WHERE rs.main_concept_id = mc.id
              )
            )
          ) ORDER BY rmc."order" ASC
        ), '[]'::jsonb) AS main_concepts
    FROM "RoadmapMainConcept" rmc
    JOIN "MainConcept" mc ON mc.id = rmc.main_concept_id
    WHERE rmc.roadmap_id = ${id}
  `;
}
