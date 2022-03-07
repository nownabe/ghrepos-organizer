import { Octokit } from "@octokit/rest";

import closeIssues from "./closeIssues";
import closePullRequests from "./closePullRequests";
import deleteRepo from "./delete";
import transfer from "./transfer";
import update from "./update";

export interface Repo {
  name: string;
  full_name: string;
  visibility?: string;
  archived?: boolean;
  owner: {
    login: string;
  };
  forks_count?: number;
  stargazers_count?: number;
  open_issues_count?: number;
}

export type Action = (
  repo: Repo,
  updateText: (text: string) => void
) => Promise<void>;

export type ActionBuilder = (octokit: Octokit) => Promise<Action>;

export type Actions = {
  targetOwner: string;
  isOwnerUser: boolean;
  actions: Action[];
};

const actionBuilders = {
  closeIssues,
  closePullRequests,
  delete: deleteRepo,
  transfer,
  update,
};

export type ActionName = keyof typeof actionBuilders;

export default actionBuilders;
