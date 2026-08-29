import type {
  PromptPreprocessor,
  PromptPreprocessorController,
} from "@lmstudio/sdk";
import type { configSchematics } from "./config";

export type PluginController = PromptPreprocessorController;

export interface PluginContext {
  withConfigSchematics(schematics: typeof configSchematics): void;
  withToolsProvider(
    provider: (ctl: PluginController) => Promise<unknown[]>,
  ): void;
  withPromptPreprocessor(preprocessor: PromptPreprocessor): void;
}
