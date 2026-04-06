"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Link as LinkIcon,
  FormInput,
  Code,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

const integrations = [
  {
    id: "chat-link",
    icon: MessageSquare,
    title: "Link de Atendimento",
    description: "Compartilhe um link direto para seus clientes iniciarem um atendimento ao vivo.",
    color: "from-blue-500 to-blue-600",
    status: "available",
  },
  {
    id: "chat-widget",
    icon: Code,
    title: "Widget de Chat",
    description: "Adicione um widget de chat no seu site para atendimento instantâneo.",
    color: "from-green-500 to-green-600",
    status: "available",
  },
  {
    id: "contact-form",
    icon: FormInput,
    title: "Formulário de Contato",
    description: "Crie um formulário personalizada para receber solicitações dos clientes.",
    color: "from-purple-500 to-purple-600",
    status: "available",
  },
  {
    id: "whatsapp",
    icon: LinkIcon,
    title: "WhatsApp",
    description: "Integre o WhatsApp para receber mensagens diretamente no painel.",
    color: "from-emerald-500 to-emerald-600",
    status: "coming-soon",
  },
  {
    id: "email",
    icon: LinkIcon,
    title: "E-mail",
    description: "Converta e-mails recebidos em chamados automaticamente.",
    color: "from-orange-500 to-orange-600",
    status: "coming-soon",
  },
  {
    id: "telegram",
    icon: LinkIcon,
    title: "Telegram",
    description: "Receba mensagens do Telegram direto no sistema de chamados.",
    color: "from-cyan-500 to-cyan-600",
    status: "coming-soon",
  },
];

const chatLink = "https://helpdesk.pro/chat/sua-empresa";
const widgetCode = `<script src="https://helpdesk.pro/widget.js" data-company="sua-empresa" async></script>`;
const formEmbedCode = `<iframe src="https://helpdesk.pro/form/sua-empresa" width="100%" height="500" frameborder="0"></iframe>`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copiado!" : "Copiar"}
    </button>
  );
}

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <div className="animate-fadeIn space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
          <p className="text-sm text-gray-500 mt-1">Conecte seu help desk a outros canais</p>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <button
              key={integration.id}
              onClick={() => setSelectedIntegration(integration.id)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className={cn("p-3 rounded-lg bg-gradient-to-br text-white", integration.color)}>
                  <integration.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {integration.title}
                    </h3>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{integration.description}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full",
                  integration.status === "available"
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-100 text-gray-400"
                )}>
                  {integration.status === "available" ? "Disponível" : "Em breve"}
                </span>
                {integration.status === "available" && (
                  <span className="text-xs text-blue-600 font-medium">Configurar →</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Integration Detail */}
        {selectedIntegration && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
            {selectedIntegration === "chat-link" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Link de Atendimento</h3>
                <p className="text-sm text-gray-500">Compartilhe este link com seus clientes para que possam iniciar um atendimento ao vivo.</p>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                  <code className="text-sm text-gray-700 flex-1 truncate">{chatLink}</code>
                  <CopyButton text={chatLink} />
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Dica:</strong> Você pode personalizar a URL nas configurações do seu domínio.
                  </p>
                </div>
              </div>
            )}

            {selectedIntegration === "chat-widget" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Widget de Chat</h3>
                <p className="text-sm text-gray-500">Adicione o widget de chat no seu site para atendimento instantâneo.</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Código para inserir no &lt;head&gt; do site:</p>
                  <div className="bg-slate-900 rounded-lg p-4">
                    <code className="text-sm text-green-400 font-mono">{widgetCode}</code>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <CopyButton text={widgetCode} />
                  </div>
                </div>
              </div>
            )}

            {selectedIntegration === "contact-form" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Formulário de Contato</h3>
                <p className="text-sm text-gray-500">Integre uma formulário de contato ao seu site via iframe ou link direto.</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Iframe:</p>
                    <div className="bg-slate-900 rounded-lg p-4">
                      <code className="text-sm text-green-400 font-mono">{formEmbedCode}</code>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <CopyButton text={formEmbedCode} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
