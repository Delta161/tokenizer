// pages/index.tsx
import ProjectCard from "@/components/ProjectCard";
import { GetServerSideProps } from "next";

type Project = {
  id: string;
  title: string;
  location: string;
  issuer: string;
  network: string;
  type: string;
  tokenPrice: number;
  tokensAvailable: number;
  totalTokens: number;
  fundedPercent: number;
  status: string;
  launchDate: string;
  description: string;
  tokenAddress: string;
  imageUrl: string;
};

export default function HomePage({ projects }: { projects: Project[] }) {
  return (
    <main className="px-6 py-10 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tokenized Real Estate</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            title={project.title}
            address={project.location}
            imageUrl={project.imageUrl}
            issuerLogoUrl="/logo.svg" // temporary until per-project logos exist
            propertyType={project.type}
            propertyPrice={`€${(project.tokenPrice * project.totalTokens).toLocaleString()}`}
            tokenPrice={`€${project.tokenPrice.toFixed(2)}`}
            minInvestment={`€${project.tokenPrice.toFixed(2)}`}
            irr="Request"
            apr="9.3%"
            valueGrowth="0.0%"
            tokensAvailable={`${project.tokensAvailable}`}
            visitorsThisWeek={4}
            visitorsAllTime={112}
          />
        ))}
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch("http://localhost:3001/api/projects");
  const projects = await res.json();

  return {
    props: {
      projects,
    },
  };
};
