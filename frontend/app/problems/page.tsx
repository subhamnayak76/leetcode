"use client"
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/v1/problems');
        console.log(response)
        const data = await response.json();
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Coding Problems</h1>
      <div className="grid gap-4">
        {problems.map((problem) => (
          <Link
            key={problem.id}
            href={`/problems/${problem.id}`}
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{problem.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${
                problem.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {problem.difficulty}
              </span>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{problem.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}