import type { Tool } from "ai";
import type { z } from "zod";

/**
 * This is a utility function to enforce types for a human-in-the-loop tool.
 * This means that the execute function will not be called immediately, but instead wait
 * for input from the user on the frontend. Once that input is provided, then the function will be called
 * @param tool The tool to wrap
 * @returns A new tool with the execute function set to undefined and the executeResult function set to the tool's execute function
 */
export const hitlTool = <
  PARAMETERS extends z.ZodTypeAny,
  RESULT,
  RESULT_PARAMETERS extends z.ZodTypeAny = PARAMETERS,
>(tool: {
  execute?: (args: z.infer<RESULT_PARAMETERS>) => Promise<RESULT>;
  description: string;
  parameters: PARAMETERS;
  resultParameters?: RESULT_PARAMETERS;
}): Tool<PARAMETERS, RESULT> & {
  executeResult?: (args: z.infer<RESULT_PARAMETERS>) => Promise<RESULT>;
  resultParameters?: RESULT_PARAMETERS;
  isHitlTool: true;
} => {
  return {
    ...tool,
    execute: undefined,
    resultParameters: tool.resultParameters,
    executeResult: tool.execute
      ? (args: z.infer<RESULT_PARAMETERS>) => tool.execute!(args)
      : undefined,
    isHitlTool: true,
  };
};
