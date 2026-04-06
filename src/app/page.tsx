import Link from "next/link";
import {
  Ticket,
  MessageSquare,
  BarChart3,
  Shield,
  Zap,
  Globe,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          HelpDesk{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Pro
          </span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
          Plataforma completa de atendimento ao cliente. Gerencie chamados, acompanhe métricas e ofereça suporte excepcional.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Acessar Painel
          </Link>
          <Link
            href="/chamado"
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            Abrir Chamado
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg backdrop-blur-sm transition-colors border border-white/20"
          >
            Criar Conta
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Tudo que sua equipe precisa
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Ticket, title: "Gestão de Chamados", desc: "Crie, acompanhe e resolva tickets com facilidade total." },
            { icon: MessageSquare, title: "Chat em Tempo Real", desc: "Atenda seus clientes ao vivo com histórico completo." },
            { icon: BarChart3, title: "Relatórios Avançados", desc: "Métricas e insights para melhorar seu atendimento." },
            { icon: Shield, title: "Segurança Total", desc: "Autenticação segura e controle de acesso por função." },
            { icon: Zap, title: "IA Integrada", desc: "Classificação automática e sugestão de respostas inteligentes." },
            { icon: Globe, title: "Base de Conhecimento", desc: "FAQ público para autoatendimento dos clientes." },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
            >
              <f.icon className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} HelpDesk Pro. Todos os direitos reservados.
      </footer>
    </div>
  );
}
