var request = require('request-promise-native');

class GitLab
{
  constructor(external_url, access_token, group, label, include_wip) {
    this.external_url = external_url;
    this.access_token = access_token;
    this.group = group;

    this.label = label;
    this.include_wip = include_wip;
  }

  getProjectMergeRequests(project_id) {
    const uri = [
      `${this.external_url}/api/v4/projects/${project_id}/merge_requests?state=opened`,
      (this.label == null) ? null : `labels=${this.label}`,
      (this.include_wip == null) ? null : `wip=${this.include_wip}`,
    ].filter(val => val).join('&')

    const options = {
      uri: uri,
      headers: {
        'PRIVATE-TOKEN': this.access_token
      },
      json: true
    };
    return request(options);
  }

  getProjects() {
    const options = {
      uri: `${this.external_url}/api/v4/groups/${this.group}/projects`,
      headers: {
        'PRIVATE-TOKEN': this.access_token
      },
      json: true
    };

    return request(options);
  }

  getGroupMergeRequests() {
    return this.getProjects()
    .then((projects) => {
      return Promise.all(projects.map((project) => this.getProjectMergeRequests(project.id)));
    })
    .then((merge_requests) => {
      return [].concat(...merge_requests);
    });
  }
}

module.exports = GitLab;