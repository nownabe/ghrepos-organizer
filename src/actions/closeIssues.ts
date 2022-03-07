import type { ActionBuilder } from ".";

const builder: ActionBuilder = async (octokit) => {
  return async (repo, updateText) => {
    if (repo.archived) {
      return;
    }

    updateText("closing issues");

    const issues = await octokit.paginate("GET /repos/{owner}/{repo}/issues", {
      owner: repo.owner.login,
      repo: repo.name,
      state: "open",
      per_page: 100,
    });

    for (let i = 0; i < issues.length; i++) {
      updateText(`closing issues (${i + 1}/${issues.length})`);

      const issue = issues[i];

      await octokit.request(
        "PATCH /repos/{owner}/{repo}/issues/{issue_number}",
        {
          owner: repo.owner.login,
          repo: repo.name,
          issue_number: issue.number,
          state: "closed",
        }
      );
    }
  };
};

export default builder;
