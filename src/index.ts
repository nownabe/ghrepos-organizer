import { Octokit } from "@octokit/rest";
import { Spinner } from "cli-spinner";
import inquirer from "inquirer";
import { Listr } from "listr2";

import type { Action, ActionName, Actions, Repo } from "./actions/index";
import actionBuilders from "./actions";

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

const actionsPrompt = async (octokit: Octokit): Promise<Actions> => {
  const user = (await octokit.request("GET /user")).data.login;

  type Result = {
    targetOwner: string;
    actions: ActionName[];
  };

  const choices = [
    {
      name: "Close all issues",
      value: "closeIssues",
    },
    {
      name: "Close all pull requests",
      value: "closePullRequests",
    },
    {
      name: "Update repository (visibility, archive, etc.)",
      value: "update",
    },
    {
      name: "Transfer repository",
      value: "transfer",
    },
  ];

  if (process.env.ENABLE_DELETE === "true") {
    choices.unshift({ name: "Delete repository", value: "delete" });
  }

  const result = await inquirer.prompt<Result>([
    {
      type: "input",
      name: "targetOwner",
      message: "Which organization do you want to organize?",
      default: user,
    },
    {
      type: "checkbox",
      name: "actions",
      message: "Choose actions.",
      choices: choices,
    },
  ]);

  if (result.actions.includes("delete")) {
    result.actions = ["delete"];
  }

  const actions: Action[] = [];

  for (const name of result.actions) {
    const builder = actionBuilders[name];
    const action = await builder(octokit);
    actions.push(action);
  }

  return {
    targetOwner: result.targetOwner,
    isOwnerUser: user === result.targetOwner,
    actions,
  };
};

const getCandidates = async (
  octokit: Octokit,
  { targetOwner, isOwnerUser }: Actions
): Promise<Repo[]> => {
  const spinner = new Spinner("%s Getting repositories...");
  spinner.start();

  let repos: Repo[];

  if (isOwnerUser) {
    repos = await octokit.paginate("GET /user/repos", {
      affiliation: "owner",
      per_page: 100,
    });
  } else {
    repos = await octokit.paginate("GET /orgs/{org}/repos", {
      org: targetOwner,
      per_page: 100,
    });
  }

  spinner.stop(true);

  return repos;
};

const reposPrompt = async (candidates: Repo[]): Promise<Repo[]> => {
  const result = await inquirer.prompt<{ repositories: Repo[] }>([
    {
      type: "checkbox",
      name: "repositories",
      message: "Choose repositories you want to organize.",
      choices: candidates.map((c) => ({
        name: ` ${c.full_name}\t(star: ${c.stargazers_count}, open issues: ${c.open_issues_count})`,
        value: c,
      })),
      pageSize: 30,
    },
  ]);

  return result.repositories;
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

  const candidates = await getCandidates(octokit, actions);
  if (candidates.length === 0) {
    return;
  }

  const repos = await reposPrompt(candidates);
  if (repos.length === 0) {
    return;
  }

  await organize(actions, repos);

  console.log("\n🎉 Completed!");
};
