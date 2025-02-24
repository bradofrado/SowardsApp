import * as ToolCalls from "./budget-workflow";

export type ToolCallName = {
  [Key in keyof typeof ToolCalls]: (typeof ToolCalls)[Key] extends {
    isHitlTool: true;
  }
    ? Key
    : never;
}[keyof typeof ToolCalls];
export type ToolCall = Pick<typeof ToolCalls, ToolCallName>;

export const isToolCall = (toolName: string): toolName is ToolCallName => {
  return Object.entries(ToolCalls).some(([key, tool]) => {
    return "isHitlTool" in tool && key === toolName;
  });
};
