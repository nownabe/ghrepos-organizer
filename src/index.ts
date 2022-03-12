import { Octokit } from "@octokit/rest";
import { Spinner } from "cli-spinner";
import inquirer from "inquirer";
import { Listr } from "listr2";

import type { Actions, Repo } from "./actions/index";
import actionsPrompt from "./prompts/actions";

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

const forkSymbol = " [fork]";

const reposPrompt = async (candidates: Repo[]): Promise<Repo[]> => {
  const indent =
    Math.max(...candidates.map((repo) => repo.full_name.length)) +
    forkSymbol.length +
    1;
  const result = await inquirer.prompt<{ repositories: Repo[] }>([
    {
      type: "checkbox",
      name: "repositories",
      message: "Choose repositories you want to organize.",
      choices: candidates.map((c) => {
        const base = ` ${c.full_name}${c.fork ? forkSymbol : ""}`;
        const space = " ".repeat(indent - base.length);
        const counts = `(star: ${c.stargazers_count}, open: ${c.open_issues_count})`;
        return {
          name: ` ${base}${space}${counts}`,
          value: c,
          short: c.name,
        };
      }),
      pageSize: 30,
    },
  ]);

  return result.repositories;
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

const getRepos = async (octokit: Octokit, actions: Actions) => {
  const candidates = await getCandidates(octokit, actions);
  if (candidates.length === 0) {
    return [];
  }

  return await reposPrompt(candidates);
};

export const run = async () => {
  const pat = await patPrompt();
  const octokit = new Octokit({ auth: pat });

  const actions = await actionsPrompt(octokit);
  if (actions.actions.length === 0) {
    return;
  }

  const repos = await getRepos(octokit, actions);
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
