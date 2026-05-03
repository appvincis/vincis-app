import { Router } from "express";
import { createTopic, getTopicsByDiscipline, getTopicById, deleteTopic, updateTopic } from './topic.controller.js'
import { requireAuth } from "../auth/auth.middleware.js";
import { injectStudyPlan, requireStudyPlan } from "../study-plan/study-plan.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createTopicSchema, updateTopicSchema } from "./topic.schema.js";

export const topicRouter = Router()

topicRouter.use(requireAuth, injectStudyPlan, requireStudyPlan)

topicRouter.post('/', validateRequest(createTopicSchema), createTopic)
topicRouter.get('/discipline/:disciplineId', getTopicsByDiscipline)
topicRouter.get('/:id', getTopicById)
topicRouter.delete('/:id', deleteTopic)
topicRouter.patch('/:id', validateRequest(updateTopicSchema), updateTopic)
