import { LinearClient, Issue, Team, Project, IssueLabel } from '@linear/sdk';
import type { LinearContext, AIGeneratedIssue } from '../types/index.js';

export class LinearService {
  private client: LinearClient;

  constructor(apiKey: string) {
    this.client = new LinearClient({ apiKey });
  }

  async getContext(): Promise<LinearContext> {
    try {
      // Fetch teams
      const teamsResponse = await this.client.teams();
      const teams = await Promise.all(
        teamsResponse.nodes.map(async (team) => ({
          id: team.id,
          name: team.name,
          key: team.key
        }))
      );

      // Fetch projects
      const projectsResponse = await this.client.projects();
      const projects = await Promise.all(
        projectsResponse.nodes.map(async (project) => {
          try {
            // Get the team for this project - projects may have teams or be workspace-level
            const projectTeams = await project.teams();
            const teamId = projectTeams?.nodes?.[0]?.id || '';

            return {
              id: project.id,
              name: project.name,
              description: project.description || undefined,
              teamId
            };
          } catch (err) {
            // If we can't get teams for a project, just use empty teamId
            return {
              id: project.id,
              name: project.name,
              description: project.description || undefined,
              teamId: ''
            };
          }
        })
      );

      // Fetch labels
      const labelsResponse = await this.client.issueLabels();
      const labels = labelsResponse.nodes.map((label) => ({
        id: label.id,
        name: label.name,
        description: label.description || undefined
      }));

      return { teams, projects, labels };
    } catch (error: any) {
      throw new Error(`Failed to fetch Linear context: ${error.message}`);
    }
  }

  async createIssue(
    teamId: string,
    issue: AIGeneratedIssue
  ): Promise<Issue> {
    try {
      // Get current user ID
      const me = await this.client.viewer;

      const issuePayload = await this.client.createIssue({
        teamId,
        title: issue.title,
        priority: issue.priority,
        projectId: issue.projectId,
        labelIds: issue.labelIds,
        assigneeId: me.id
      });

      const createdIssue = await issuePayload.issue;

      if (!createdIssue) {
        throw new Error('Issue creation returned null');
      }

      return createdIssue;
    } catch (error: any) {
      throw new Error(`Failed to create Linear issue: ${error.message}`);
    }
  }

  async getIssue(issueIdentifier: string): Promise<{ id: string; identifier: string; title: string; branchName: string } | null> {
    try {
      const issue = await this.client.issue(issueIdentifier);
      if (!issue) return null;

      return {
        id: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        branchName: issue.branchName,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch issue: ${error.message}`);
    }
  }

  async getMyIssues(): Promise<Issue[]> {
    try {
      const me = await this.client.viewer;
      const issues = await me.assignedIssues();
      return issues.nodes;
    } catch (error: any) {
      throw new Error(`Failed to fetch issues: ${error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.viewer;
      return true;
    } catch {
      return false;
    }
  }
}
