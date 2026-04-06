"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Modal from "@/components/ui/Modal";
import { KnowledgeBaseArticle } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import {
  PlusCircle,
  Search,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewArticle, setShowNewArticle] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("knowledge_base")
        .select("*")
        .order("created_at", { ascending: false });
      setArticles((data as unknown as KnowledgeBaseArticle[]) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(articles.map((a) => a.category))];

  const handleCreateArticle = async (data: {
    title: string;
    category: string;
    content: string;
    is_published: boolean;
  }) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("knowledge_base").insert({
      title: data.title,
      category: data.category,
      content: data.content,
      is_published: data.is_published,
      views: 0,
      created_by: user?.id || "00000000-0000-0000-0000-000000000000",
      company_id: "00000000-0000-0000-0000-000000000001",
    });

    if (!error) {
      setShowNewArticle(false);
      const { data: refreshed } = await supabase
        .from("knowledge_base")
        .select("*")
        .order("created_at", { ascending: false });
      setArticles((refreshed as unknown as KnowledgeBaseArticle[]) || []);
    }
  };

  const handleUpdateArticle = async (
    id: string,
    data: { title: string; category: string; content: string; is_published: boolean }
  ) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("knowledge_base")
      .update(data)
      .eq("id", id);

    if (!error) {
      setEditingArticle(null);
      const { data: refreshed } = await supabase
        .from("knowledge_base")
        .select("*")
        .order("created_at", { ascending: false });
      setArticles((refreshed as unknown as KnowledgeBaseArticle[]) || []);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fadeIn space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Base de Conhecimento</h1>
            <p className="text-sm text-gray-500 mt-1">
              {articles.length} artigos publicados
            </p>
          </div>
          <button
            onClick={() => setShowNewArticle(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Novo Artigo
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar artigos..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap">
          <span
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer",
              "bg-blue-600 text-white"
            )}
          >
            Todos ({articles.length})
          </span>
          {categories.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
            >
              {cat} ({articles.filter((a) => a.category === cat).length})
            </span>
          ))}
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 flex items-center justify-center">
            <p className="text-gray-400">Carregando artigos...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-16 text-gray-500">
            <p className="text-lg font-medium">Nenhum artigo encontrado</p>
            <p className="text-sm mt-1">Crie um novo artigo para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className={cn(
                  "bg-white rounded-xl border p-5 transition-all",
                  article.is_published
                    ? "border-gray-100 hover:shadow-md shadow-sm"
                    : "border-yellow-200 bg-yellow-50"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      {article.is_published ? (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          Publicado
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                          Rascunho
                        </span>
                      )}
                    </div>
                    <h3
                      className="text-base font-semibold text-gray-900 group-hover:text-blue-600 hover:cursor-pointer"
                      onClick={() => setSelectedArticle(article)}
                    >
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {article.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span>{article.category}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {article.views}{" "}
                        visualizações
                      </span>
                      <span>{formatDate(article.updated_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingArticle(article)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Article Modal */}
      <Modal
        isOpen={showNewArticle || !!editingArticle}
        onClose={() => {
          setShowNewArticle(false);
          setEditingArticle(null);
        }}
        title={editingArticle ? "Editar Artigo" : "Novo Artigo"}
      >
        <ArticleForm
          article={editingArticle}
          onSubmit={(data) => {
            if (editingArticle) {
              handleUpdateArticle(editingArticle.id, data);
            } else {
              handleCreateArticle(data);
            }
          }}
          onCancel={() => {
            setShowNewArticle(false);
            setEditingArticle(null);
          }}
        />
      </Modal>

      {/* View Article Modal */}
      <Modal
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        title={selectedArticle?.title || ""}
      >
        {selectedArticle && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium">
                {selectedArticle.category}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> {selectedArticle.views}{" "}
                visualizações
              </span>
              <span>
                Atualizado em {formatDate(selectedArticle.updated_at)}
              </span>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedArticle.content}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

function ArticleForm({
  article,
  onSubmit,
  onCancel,
}: {
  article: KnowledgeBaseArticle | null;
  onSubmit: (data: {
    title: string;
    category: string;
    content: string;
    is_published: boolean;
  }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(article?.title || "");
  const [category, setCategory] = useState(article?.category || "Geral");
  const [content, setContent] = useState(article?.content || "");
  const [isPublished, setIsPublished] = useState(article?.is_published ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit({ title, category, content, is_published: isPublished });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoria
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option>Acesso</option>
          <option>Configuração</option>
          <option>Financeiro</option>
          <option>Geral</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Conteúdo
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          id="published"
          className="rounded"
        />
        <label htmlFor="published" className="text-sm text-gray-600">
          Publicar imediatamente
        </label>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
