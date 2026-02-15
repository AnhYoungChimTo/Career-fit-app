import { Request, Response } from 'express';
/**
 * GET /api/interviews/questions/lite
 * Get all Lite interview questions
 */
export declare function getLiteQuestions(_req: Request, res: Response): Promise<void>;
/**
 * GET /api/interviews/questions/deep/modules
 * Get all Deep modules metadata
 */
export declare function getDeepModulesMetadata(_req: Request, res: Response): Promise<void>;
/**
 * GET /api/interviews/questions/deep/:moduleId
 * Get specific Deep module questions
 */
export declare function getDeepModule(req: Request, res: Response): Promise<void>;
/**
 * POST /api/interviews/start
 * Start a new interview
 */
export declare function startInterview(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * PUT /api/interviews/:id/answer
 * Save an answer to the current interview
 */
export declare function saveAnswer(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * PUT /api/interviews/:id/position
 * Update current position in interview
 */
export declare function updatePosition(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/interviews/:id
 * Get interview status and progress
 */
export declare function getInterviewStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/interviews/:id/complete-module
 * Mark a module as complete
 */
export declare function completeModule(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/interviews/:id/complete
 * Mark interview as complete
 */
export declare function completeInterview(req: Request, res: Response): Promise<void>;
/**
 * GET /api/interviews/my-interviews
 * Get current user's interviews
 */
export declare function getMyInterviews(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=interview.controller.d.ts.map