import type { ActionBuilder } from ".";

const builder: ActionBuilder = async (octokit) => {
  return async (repo, updateText) => {
    if (repo.archived) {
      return;
    }

    updateText("closing pull requests");

    const pulls = await octokit.paginate("GET /repos/{owner}/{repo}/pulls", {
      owner: repo.owner.login,
      repo: repo.name,
      state: "open",
      per_page: 100,
    });

    for (let i = 0; i < pulls.length; i++) {
      updateText(`closing pull requests (${i + 1}/${pulls.length})`);

      const pull = pulls[i];

      await octokit.request("PATCH /repos/{owner}/{repo}/pulls/{pull_number}", {
        owner: repo.owner.login,
        repo: repo.name,
        pull_number: pull.number,
        state: "closed",
      });
    }
  };
};

export default builder;
