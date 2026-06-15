import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ProjectCard({ project }: { project: any }) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="w-full h-40 overflow-hidden relative bg-muted">
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
      </div>
      <CardContent className="p-5 relative -mt-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{project.title}</h3>
          <div className="flex items-center text-amber-500 text-xs font-semibold bg-amber-500/10 px-2 py-1 rounded-full">
            <Star className="h-3 w-3 mr-1 fill-amber-500" />
            {project.stars}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {project.techStack.map((tech: string) => (
            <Badge key={tech} variant="outline" className="text-[10px] font-mono">
              {tech}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Link href={project.githubUrl} className="w-full">
            <Button size="sm" variant="outline" className="w-full gap-2 rounded-xl">
              <Code className="h-4 w-4" /> Code
            </Button>
          </Link>
          <Link href={project.liveUrl} className="w-full">
            <Button size="sm" className="w-full gap-2 rounded-xl">
              <ExternalLink className="h-4 w-4" /> Demo
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
