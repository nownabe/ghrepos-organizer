import { Octokit } from "@octokit/rest";
import { Spinner } from "cli-spinner";
import inquirer from "inquirer";

import { Actions, Repo } from "../actions";

type Filter = {
  visibility?: "public" | "private" | null;
  fork?: boolean | null;
  archived?: boolean | null;
  open_issues_count?: boolean | null;
};

type FilterFunc = (repo: Repo) => boolean;

const filterQuestions: inquirer.QuestionCollection<Filter> = [
  {
    type: "list",
    name: "visibility",
    message: "Filter by visibility?",
    choices: [
      { name: "No", value: null },
      { name: "Only show public repositories", value: "public" },
      { name: "Only show private repositories", value: "private" },
    ],
    default: null,
  },
  {
    type: "list",
    name: "fork",
    message: "Filter by fork or not?",
    choices: [
      { name: "No", value: null },
      { name: "Only show fork repositories", value: true },
      { name: "Only show non-fork repositories", value: false },
    ],
    default: null,
  },
  {
    type: "list",
    name: "archived",
    message: "Filter by archived or not?",
    choices: [
      { name: "No", value: null },
      { name: "Only show archived repositories", value: true },
      { name: "Only show not archived repositories", value: false },
    ],
    default: null,
  },
  {
    type: "list",
    name: "open_issues_count",
    message: "Filter by open issue count?",
    choices: [
      { name: "No", value: null },
      {
        name: "Only show respositories which have no open issues",
        value: true,
      },
      { name: "Only show repositories which have open issues", value: false },
    ],
    default: null,
  },
];

const buildFilterFunc =
  (filter: Filter): FilterFunc =>
  (repo: Repo): boolean => {
    if (
      ["visibility", "fork", "archived"].some((k) => {
        if (filter[k] !== null && repo[k] !== filter[k]) {
          console.log(repo.full_name, k, filter[k], repo[k]);
        }
        return filter[k] !== null && repo[k] !== filter[k];
      })
    ) {
      return false;
    }

    if (filter.open_issues_count !== null) {
      if (filter.open_issues_count && repo.open_issues_count !== 0) {
        console.log(
          repo.full_name,
          filter.open_issues_count,
          repo.open_issues_count
        );
        return false;
      } else if (!filter.open_issues_count && repo.open_issues_count === 0) {
        console.log(
          repo.full_name,
          filter.open_issues_count,
          repo.open_issues_count
        );
        return false;
      }
    }

    return true;
  };

const filterPrompt = async (): Promise<FilterFunc> => {
  const useFilter = await inquirer.prompt<{ useFilter: boolean }>([
    {
      type: "confirm",
      name: "useFilter",
      message: "Filter repositories by properties?",
      default: false,
    },
  ]);

  if (!useFilter.useFilter) {
    return (_repo: Repo) => true;
  }

  const filter = await inquirer.prompt<Filter>(filterQuestions);
  console.log(filter);

  return buildFilterFunc(filter);
};

const getCandidates = async (
  octokit: Octokit,
  { targetOwner, isOwnerUser }: Actions,
  filter: FilterFunc
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

  return repos.filter(filter);
};

const forkSymbol = " [fork]";
const repoText = (repo: Repo, indent: number) => {
  const base = ` ${repo.full_name}${repo.fork ? forkSymbol : ""}`;
  const space = " ".repeat(indent - base.length);
  const supplement = `(${
    repo.visibility === "public" ? "public,  " : "private, "
  }star: ${repo.stargazers_count}, open: ${repo.open_issues_count}${
    repo.archived ? ", archived" : ""
  })`;

  return ` ${base}${space}${supplement}`;
};

const chooseReposPrompt = async (candidates: Repo[]): Promise<Repo[]> => {
  const indent =
    Math.max(...candidates.map((repo) => repo.full_name.length)) +
    forkSymbol.length +
    1;

  const result = await inquirer.prompt<{ repositories: Repo[] }>([
    {
      type: "checkbox",
      name: "repositories",
      message: "Choose repositories to organize.",
      choices: candidates.map((c) => {
        return {
          name: repoText(c, indent),
          value: c,
          short: c.name,
        };
      }),
      pageSize: 30,
    },
  ]);

  return result.repositories;
};

const reposPrompt = async (octokit: Octokit, actions: Actions) => {
  const filter = await filterPrompt();
  const candidates = await getCandidates(octokit, actions, filter);
  if (candidates.length === 0) {
    return [];
  }

  return await chooseReposPrompt(candidates);
};

export default reposPrompt;
