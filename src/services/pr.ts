import { execa } from 'execa';
import { AIService } from './ai.js';

export interface PRAnalysis {
  title: string;
  description: string;
  reviewers: string[];
}

export const analyzePRContent = async (
  repoBase: string,
  baseBranch: string,
  apiKey: string
): Promise<{ commits: string[]; diff: string; files: string[] }> => {
  // Get commits
  const { stdout: commitsRaw } = await execa(
    'git',
    ['log', `${baseBranch}..HEAD`, '--pretty=format:%s'],
    { cwd: repoBase }
  );

  const commits = commitsRaw.split('\n').filter(Boolean);

  // Get diff
  const { stdout: diff } = await execa(
    'git',
    ['diff', `${baseBranch}...HEAD`],
    { cwd: repoBase }
  );

  // Get changed files
  const { stdout: filesRaw } = await execa(
    'git',
    ['diff', `${baseBranch}...HEAD`, '--name-only'],
    { cwd: repoBase }
  );

  const files = filesRaw.split('\n').filter(Boolean);

  return { commits, diff, files };
};

export const suggestReviewers = async (
  repoBase: string,
  files: string[]
): Promise<string[]> => {
  const reviewers = new Set<string>();

  for (const file of files.slice(0, 10)) { // Limit to 10 files for performance
    try {
      const { stdout } = await execa(
        'git',
        ['log', '-n', '5', '--pretty=format:%an <%ae>', '--', file],
        { cwd: repoBase }
      );

      const authors = stdout.split('\n').filter(Boolean);
      authors.forEach(author => reviewers.add(author));
    } catch {
      // Skip files with no history
    }
  }

  return Array.from(reviewers).slice(0, 5); // Top 5 reviewers
};

export const generatePRContent = async (
  commits: string[],
  diff: string,
  files: string[],
  apiKey: string
): Promise<{ title: string; description: string }> => {
  const aiService = new AIService(apiKey);

  // Truncate diff if too long (keep first 5000 chars)
  const truncatedDiff = diff.slice(0, 5000);

  const prompt = `Analyze these git changes and generate a Pull Request title and description.

COMMITS:
${commits.join('\n')}

CHANGED FILES:
${files.join('\n')}

DIFF SUMMARY:
${truncatedDiff}

Generate:
1. A concise PR title (following conventional commits: feat/fix/refactor/docs/etc)
2. A comprehensive PR description with:
   - Summary of changes
   - Motivation and context
   - Key changes (bullet points)
   - Testing notes (if applicable)
   - Breaking changes (if any)

Keep it professional and focused on what reviewers need to know.`;

  // Use generateText for PR content
  const { generateText } = await import('ai');
  const { text } = await generateText({
    model: aiService['provider'](aiService['model']),
    prompt
  });

  // Parse the response (simple approach - extract title and body)
  const lines = text.split('\n');
  const titleLine = lines.find(l => l.trim() && !l.startsWith('#'));
  const title = titleLine?.trim() || commits[0] || 'Update';

  // Find description (everything after the title)
  const titleIndex = lines.indexOf(titleLine || '');
  const description = lines.slice(titleIndex + 1).join('\n').trim();

  return {
    title: title.replace(/^(Title|PR Title):\s*/i, ''),
    description: description || 'See commits for details.'
  };
};

export const createPullRequest = async (
  repoBase: string,
  title: string,
  description: string,
  baseBranch: string
): Promise<string> => {
  try {
    const { stdout } = await execa(
      'gh',
      ['pr', 'create', '--base', baseBranch, '--title', title, '--body', description],
      { cwd: repoBase }
    );

    return stdout.trim();
  } catch (error: any) {
    throw new Error(`Failed to create PR: ${error.message}`);
  }
};

export const getCurrentBranch = async (repoBase: string): Promise<string> => {
  const { stdout } = await execa('git', ['branch', '--show-current'], {
    cwd: repoBase
  });
  return stdout.trim();
};

export const extractLinearIssueId = (branchName: string): string | null => {
  // Match patterns like: user/PROJ-123-description or PROJ-123-description
  const match = branchName.match(/([A-Z]+-\d+)/);
  return match ? match[1] : null;
};
