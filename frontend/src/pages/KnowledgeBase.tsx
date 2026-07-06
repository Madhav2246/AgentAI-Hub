import { useState } from 'react';
import { 
  Database, 
  Plus, 
  X, 
  FileText, 
  Link2, 
  DatabaseZap, 
  Search, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { KnowledgeSource } from '../types/types';

interface KnowledgeBaseProps {
  knowledge: KnowledgeSource[];
  agents: Agent[];
  onAddKnowledge: (name: string, type: KnowledgeSource['type'], description: string, size: number) => void;
}

export default function KnowledgeBase({ knowledge, agents, onAddKnowledge }: KnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<KnowledgeSource['type']>('pdf');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name && !fileUrl) return;

    const finalName = type === 'url' ? fileUrl : name;
    const finalSize = Math.floor(Math.random() * 500000) + 12000; // Mock bytes size
    
    onAddKnowledge(finalName, type, description || "Uploaded workspace knowledge source.", finalSize);
    
    setName('');
    setType('pdf');
    setDescription('');
    setFileUrl('');
    setIsModalOpen(false);
  };


  const getFileIcon = (t: KnowledgeSource['type']) => {
    switch (t) {
      case 'url':
        return <Link2 className="h-4.5 w-4.5 text-sky-500" />;
      case 'csv':
        return <DatabaseZap className="h-4.5 w-4.5 text-emerald-500" />;
      case 'pdf':
        return <FileText className="h-4.5 w-4.5 text-rose-500" />;
      case 'docx':
        return <FileText className="h-4.5 w-4.5 text-blue-500" />;
      case 'notion':
        return <FileText className="h-4.5 w-4.5 text-purple-500" />;
      default:
        return <FileText className="h-4.5 w-4.5 text-zinc-500" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const filteredKnowledge = knowledge.filter(k => 
    k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (k.description && k.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    k.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Knowledge Base</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Index business documents, guides, guidelines and CSV databases for agent RAG tooling.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search Filter bar */}
      <div className="flex items-center gap-2 p-2 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md shadow-sm">
        <Search className="h-4 w-4 text-zinc-400 ml-1.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search indexed sources by name, description, or type..."
          className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-450 rounded-md">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Grid of uploaded files */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredKnowledge.length === 0 ? (
          <div className="col-span-full p-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-xs text-zinc-550 space-y-2">
            <Database className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <p>No indexed knowledge sources match your search query.</p>
          </div>
        ) : (
          filteredKnowledge.map((source) => (
            <div key={source.id} className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl shadow-sm flex flex-col justify-between min-h-[170px] hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-750 transition-all group">
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-zinc-50 dark:bg-zinc-850 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-800 transition-colors shrink-0">
                    {getFileIcon(source.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-zinc-950 dark:text-white truncate" title={source.name}>{source.name}</h4>
                    <span className="block text-[9px] text-zinc-400 uppercase font-bold tracking-wider mt-0.5">{source.type} • {formatSize(source.sizeBytes)}</span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{source.description}</p>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-850/60 flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5 text-[9px] text-emerald-500 font-bold font-mono">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>INDEXED</span>
                </div>
                <span className="text-[9px] text-zinc-450 font-mono">
                  {new Date(source.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Permissions mapping audit table */}
      <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Access Controls Audit</h3>
          <span className="text-[10px] text-zinc-500">Verify which AI Employees have access rights to query indexed knowledge bases.</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                <th className="p-3">AI Employee</th>
                <th className="p-3">Department</th>
                <th className="p-3">Permitted Index Access</th>
                <th className="p-3 text-right">RAG Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10">
                  <td className="p-3 flex items-center gap-2 font-semibold text-zinc-950 dark:text-white">
                    <span 
                      className="h-2 w-2 rounded-full" 
                      style={{ backgroundColor: agent.avatarColor }} 
                    />
                    <span>{agent.name}</span>
                  </td>
                  <td className="p-3 text-zinc-500">{agent.department}</td>
                  <td className="p-3 font-mono text-zinc-500">
                    {agent.knowledgeSources.length === 0 ? "All (*)" : agent.knowledgeSources.join(", ")}
                  </td>
                  <td className="p-3 text-right font-medium text-emerald-500 font-mono">Sync active</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0c0c0f] border border-zinc-250 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-blue-600" />
                  <span>Index Knowledge</span>
                </h3>
                <span className="text-[10px] text-zinc-500">Index files or URLs for agent RAG access.</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-400 hover:text-zinc-650 rounded-md cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-500 block">Knowledge Type</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value as KnowledgeSource['type'])}
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  <option value="pdf">PDF File</option>
                  <option value="docx">Word Document (DOCX)</option>
                  <option value="csv">CSV Sheet Database</option>
                  <option value="url">Website URL Address</option>
                  <option value="notion">Notion Export (Markdown)</option>
                </select>
              </div>

              {type === 'url' ? (
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-500 block">Website URL Link</label>
                  <input 
                    type="url" 
                    value={fileUrl} 
                    onChange={e => setFileUrl(e.target.value)} 
                    placeholder="https://docs.agenthub.ai/pricing"
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-medium"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-500 block">Document Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g. Q3 Sales Forecast.csv"
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-500 block">Description / Notes</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Summarize file contents for RAG semantic search triggers..."
                  rows={3}
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800/80 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow cursor-pointer transition-colors"
                >
                  Index Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
