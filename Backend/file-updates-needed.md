# Files That Need Updates to Use Common Utilities

## Background

The codebase should consistently use common utilities like `sendResponse` for standardized API responses and `paginate` for handling pagination. This promotes code consistency, maintainability, and reduces duplication.

## Files Needing Updates

### Controllers Not Using `sendResponse`

1. **src/controllers/adminController.ts**

   - Currently uses direct `res.json()` instead of the standardized `sendResponse`
   - All controller methods need to be updated

2. **src/controllers/communityForumControllers.ts**

   - Currently uses direct `res.status().json()` responses
   - All controller methods need to be updated

3. **src/controllers/courseControllers.ts**

   - Currently uses direct `res.status().json()` responses
   - All controller methods need to be updated

4. **src/controllers/authController.ts**

   - Currently uses direct `res.status().json()` responses
   - `getAllUsers` method needs to be updated

5. **src/controllers/jobControllers.ts**

   - Currently uses direct `res.status().json()` responses
   - All controller methods need to be updated

6. **src/controllers/challengeController.ts**

   - Uses a mix of direct responses and class-based methods
   - Both functional and class-based methods need to be updated

7. **src/controllers/roadMapControllers.ts** (Partial Updates Needed)
   - Some methods like `getRoadMap`, `createRoadMap`, `updateRoadMap`, `deleteRoadMap`, and `updateSubjectsOrder` are not using `sendResponse`
   - Other methods are correctly using `sendResponse`

### Controllers Not Using `paginate`

1. **src/controllers/challengeController.ts**

   - Currently implements custom pagination logic instead of using the common `paginate` utility
   - Methods like `getChallenges` and `getChallenge` need to be updated

2. **src/controllers/communityForumControllers.ts**

   - No pagination implementation for listing forums
   - `getForums` method needs to be updated

3. **src/controllers/courseControllers.ts**

   - No pagination implementation for listing courses
   - `getCourses` method needs to be updated

4. **src/controllers/jobControllers.ts**

   - No pagination implementation for listing jobs
   - `getJobs` method needs to be updated

5. **src/controllers/authController.ts**
   - `getAllUsers` method should use pagination

## Additional Notes

- When updating each file, ensure that appropriate response types are added to the `ResponseType` type in `src/utils/apiResponse.ts`
- For pagination, ensure that search fields are correctly defined for each model
- Consider adding common error handling using `sendError` from `apiResponse.ts` where appropriate
