import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, 'src/components/Dashboard.tsx');
let code = fs.readFileSync(file, 'utf8');

const newModules = `
  // 📚 STANDARDS
  {
    id: "is-codes-reference",
    title: "IS Codes Reference",
    desc: "Comprehensive database of Indian Standard codes for civil engineering.",
    category: "Standards",
    icon: BookOpen,
    styleStyle: "glass",
    colorClass: "bg-white/80 backdrop-blur-md text-[#0072de]",
    difficulty: "Beginner",
    estimatedTime: "Read",
  },
  {
    id: "morth-irc-specs",
    title: "MORTH/IRC Specifications",
    desc: "Ministry of Road Transport and Highways & Indian Roads Congress specs.",
    category: "Standards",
    icon: BookOpen,
    styleStyle: "glass",
    colorClass: "bg-white/80 backdrop-blur-md text-[#0072de]",
    difficulty: "Intermediate",
    estimatedTime: "Read",
  },
  {
    id: "pakistan-building-codes",
    title: "Pakistan Building Codes",
    desc: "Building Code of Pakistan (BCP) requirements and guidelines.",
    category: "Standards",
    icon: BookOpen,
    styleStyle: "glass",
    colorClass: "bg-white/80 backdrop-blur-md text-emerald-600",
    difficulty: "Intermediate",
    estimatedTime: "Read",
  },
  {
    id: "uae-construction-standards",
    title: "UAE Construction Standards",
    desc: "Dubai Municipality and Abu Dhabi building codes and regulations.",
    category: "Standards",
    icon: BookOpen,
    styleStyle: "glass",
    colorClass: "bg-white/80 backdrop-blur-md text-emerald-600",
    difficulty: "Advanced",
    estimatedTime: "Read",
  },

  // 📝 RESOURCES
  {
    id: "boq-templates",
    title: "BOQ Templates",
    desc: "Downloadable Bill of Quantities templates in Excel format.",
    category: "Resources",
    icon: FileText,
    styleStyle: "solid",
    colorClass: "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30",
    difficulty: "Beginner",
    estimatedTime: "Download",
    isPopular: true,
  },
  {
    id: "cost-guide-pakistan",
    title: "Construction Cost Guide Pakistan 2025",
    desc: "Latest material and labor rates overview for 2025.",
    category: "Resources",
    icon: BookOpen,
    styleStyle: "glass",
    colorClass: "bg-white/80 backdrop-blur-md text-emerald-600",
    difficulty: "Beginner",
    estimatedTime: "Read",
    isNew: true,
  },
  {
    id: "blog",
    title: "Civil Engineering Blog",
    desc: "Articles, tutorials, and case studies on modern construction.",
    category: "Resources",
    icon: FileText,
    styleStyle: "glass",
    colorClass: "bg-white/80 backdrop-blur-md text-slate-800",
    difficulty: "Beginner",
    estimatedTime: "Read",
  },
];`;

code = code.replace(/  \},\n\];/g, '  },' + newModules);
fs.writeFileSync(file, code);
