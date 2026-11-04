// Paraphrased from primary SDSC sources; reviewed 2026-10-09.
// Match catalog names, not snapshot-specific numeric IDs.
export const seriesDescriptions: Record<
  string,
  { description: string; sources: string[] }
> = {
  "Advanced Computing Series": {
    description:
      "Explore emerging research computing methods, from AI and machine learning to performance analysis, visualization, big data and accelerated computing. Sessions introduce tools and practical examples for advanced SDSC systems.",
    sources: [
      "https://www.sdsc.edu/education/training-programs/Advanced-HPC-CI-Webinars.html",
      "https://www.sdsc.edu/education/on-demand-learning/index.html",
    ],
  },
  CIML: {
    description:
      "Cyberinfrastructure-Enabled Machine Learning (CIML) teaches researchers to scale machine learning and data science from laptops and workstations to high-performance computing systems, with hands-on tutorials using SDSC's Expanse.",
    sources: [
      "https://www.sdsc.edu/education/training-programs/CIML.html",
      "https://ciml.sdsc.edu/",
    ],
  },
  COMPLECS: {
    description:
      "Comprehensive Learning for End-users to Effectively Utilize Cyberinfrastructure (COMPLECS) builds the skills needed to use supercomputers: Linux, parallel computing concepts, batch jobs, data management, security and interactive computing.",
    sources: ["https://www.sdsc.edu/education/training-programs/COMPLECS.html"],
  },
  "SDSC Webinars": {
    description:
      "San Diego Supercomputer Center (SDSC) webinars introduce research computing tools and practices, including running jobs, managing data, GPU computing, containers, Python and Jupyter notebooks on high-performance computing systems.",
    sources: [
      "https://www.sdsc.edu/education/on-demand-learning/index.html",
      "https://www.sdsc.edu/_files/docs/annual_report_fy2019-20_web.pdf",
    ],
  },
  "Summer Institute": {
    description:
      "SDSC's HPC and Data Science Summer Institute offers introductory to intermediate training in high-performance computing and data science. Lectures and hands-on exercises help researchers use computing resources beyond their local machines.",
    sources: [
      "https://www.sdsc.edu/education/training-programs/index.html",
      "https://github.com/sdsc/sdsc-summer-institute-2025",
    ],
  },
  "TSCC Workshop Series": {
    description:
      "Triton Shared Computing Cluster (TSCC) workshops help researchers access and use UC San Diego's shared HPC system. Topics include accounts, allocations, software environments, filesystems, job submission, Python and secure Jupyter notebooks.",
    sources: [
      "https://www.sdsc.edu/education/on-demand-learning/index.html",
      "https://www.sdsc.edu/services/hpc.html",
    ],
  },
};

export function seriesDescription(name: string): string {
  return (
    Object.entries(seriesDescriptions).find(([key]) => key === name)?.[1]
      .description ?? `A verified description for ${name} is not yet available.`
  );
}
