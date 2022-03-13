import { Octokit } from "@octokit/rest";
import { Spinner } from "cli-spinner";
import inquirer from "inquirer";
import { Listr } from "listr2";

import type { Actions, Repo } from "./actions/index";
import actionsPrompt from "./prompts/actions";
import reposPrompt from "./prompts/repos";

Spinner.setDefaultSpinnerString("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏");

const concurrency = parseInt(process.env.CONCURRENCY) || 5;

const patPrompt = async (): Promise<string> => {
  const result = await inquirer.prompt([
    {
      type: "password",
      name: "pat",
      message: "GitHub Personal Access Token:",
      when: !process.env.GH_PAT,
    },
  ]);

  return result.pat || process.env.GH_PAT;
};

const confirmPrompt = async () => {
  const result = await inquirer.prompt<{ confirm: boolean }>([
    {
      type: "confirm",
      name: "confirm",
      message: "Are you sure?",
      default: false,
    },
  ]);
  return result.confirm;
};

const organize = async (actions: Actions, repos: Repo[]) => {
  const tasks = new Listr(
    repos.map((repo) => ({
      title: repo.full_name,
      task: async (ctx, task) => {
        const updateText = (text: string) => {
          task.output = text;
        };
        for (const action of actions.actions) {
          await action(repo, updateText);
        }
      },
    })),
    { concurrent: concurrency }
  );
  await tasks.run();
};

export const run = async () => {
  const pat = await patPrompt();
  const octokit = new Octokit({ auth: pat });

  const actions = await actionsPrompt(octokit);
  if (actions.actions.length === 0) {
    return;
  }

  const repos = await reposPrompt(octokit, actions);
  if (repos.length === 0) {
    return;
  }

  if (!(await confirmPrompt())) {
    console.log("Canceled.");
    return;
  }

  await organize(actions, repos);

  console.log("\n🎉 Completed!");
};
